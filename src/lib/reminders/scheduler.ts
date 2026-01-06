import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email/resend'
import { getReminderTemplate, getSubjectLine } from '@/lib/email/templates/reminders'
import { ReminderType, ReminderEmailData } from '@/lib/email/types'
import { mergeWithDefaults, ReminderSettings } from './types'

export async function scheduleRemindersForInvoice(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            client: true,
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    businessName: true,
                    email: true,
                    reminderSettings: true,
                },
            },
        },
    })

    if (!invoice || invoice.status === 'paid' || invoice.status === 'cancelled') {
        return
    }

    const settings = mergeWithDefaults(invoice.user.reminderSettings as Partial<ReminderSettings> | null)

    if (!settings.enabled) {
        return
    }

    const dueDate = new Date(invoice.dueDate)
    const now = new Date()

    // Delete any pending reminders for this invoice
    await prisma.reminderSchedule.deleteMany({
        where: {
            invoiceId,
            status: 'scheduled',
        },
    })

    const remindersToSchedule: { type: ReminderType; date: Date; daysOffset: number }[] = []

    // Upcoming due reminder
    if (settings.schedule.upcomingDue.enabled) {
        const scheduledDate = new Date(dueDate)
        scheduledDate.setDate(scheduledDate.getDate() - settings.schedule.upcomingDue.daysBefore)
        if (scheduledDate > now) {
            remindersToSchedule.push({
                type: 'upcoming_due',
                date: scheduledDate,
                daysOffset: -settings.schedule.upcomingDue.daysBefore
            })
        }
    }

    // Due today reminder
    if (settings.schedule.dueToday.enabled) {
        const scheduledDate = new Date(dueDate)
        scheduledDate.setHours(9, 0, 0, 0) // 9 AM on due date
        if (scheduledDate > now) {
            remindersToSchedule.push({ type: 'due_today', date: scheduledDate, daysOffset: 0 })
        }
    }

    // Overdue gentle
    if (settings.schedule.overdueGentle.enabled) {
        const scheduledDate = new Date(dueDate)
        scheduledDate.setDate(scheduledDate.getDate() + settings.schedule.overdueGentle.daysAfter)
        remindersToSchedule.push({
            type: 'overdue_gentle',
            date: scheduledDate,
            daysOffset: settings.schedule.overdueGentle.daysAfter
        })
    }

    // Overdue firm
    if (settings.schedule.overdueFirm.enabled) {
        const scheduledDate = new Date(dueDate)
        scheduledDate.setDate(scheduledDate.getDate() + settings.schedule.overdueFirm.daysAfter)
        remindersToSchedule.push({
            type: 'overdue_firm',
            date: scheduledDate,
            daysOffset: settings.schedule.overdueFirm.daysAfter
        })
    }

    // Overdue final
    if (settings.schedule.overdueFinal.enabled) {
        const scheduledDate = new Date(dueDate)
        scheduledDate.setDate(scheduledDate.getDate() + settings.schedule.overdueFinal.daysAfter)
        remindersToSchedule.push({
            type: 'overdue_final',
            date: scheduledDate,
            daysOffset: settings.schedule.overdueFinal.daysAfter
        })
    }

    // Overdue urgent
    if (settings.schedule.overdueUrgent.enabled) {
        const scheduledDate = new Date(dueDate)
        scheduledDate.setDate(scheduledDate.getDate() + settings.schedule.overdueUrgent.daysAfter)
        remindersToSchedule.push({
            type: 'overdue_urgent',
            date: scheduledDate,
            daysOffset: settings.schedule.overdueUrgent.daysAfter
        })
    }

    // Create reminder logs
    for (const reminder of remindersToSchedule) {
        await prisma.reminderSchedule.create({
            data: {
                userId: invoice.userId,
                invoiceId,
                reminderType: reminder.type,
                daysOffset: reminder.daysOffset,
                scheduledFor: reminder.date,
                status: 'scheduled',
            },
        })
    }

    return remindersToSchedule.length
}

export async function processScheduledReminders() {
    const now = new Date()

    // Find reminders that are due
    const dueReminders = await prisma.reminderSchedule.findMany({
        where: {
            status: 'scheduled',
            scheduledFor: { lte: now },
        },
        include: {
            invoice: {
                include: {
                    client: true,
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            businessName: true,
                            email: true,
                        },
                    },
                },
            },
        },
        take: 50, // Process in batches
    })

    const results = {
        processed: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
    }

    for (const reminder of dueReminders) {
        results.processed++

        // Skip if invoice is already paid or cancelled
        if (reminder.invoice.status === 'paid' || reminder.invoice.status === 'cancelled') {
            await prisma.reminderSchedule.update({
                where: { id: reminder.id },
                data: { status: 'cancelled' },
            })
            results.skipped++
            continue
        }

        // Skip if invoice has been fully paid since scheduling
        if (reminder.invoice.amountPaid >= reminder.invoice.total) {
            await prisma.reminderSchedule.update({
                where: { id: reminder.id },
                data: { status: 'cancelled' },
            })
            results.skipped++
            continue
        }

        try {
            await sendReminderEmail(reminder)
            await prisma.reminderSchedule.update({
                where: { id: reminder.id },
                data: {
                    status: 'sent',
                    sentAt: new Date(),
                },
            })

            // Update invoice reminder count
            await prisma.invoice.update({
                where: { id: reminder.invoiceId },
                data: {
                    reminderCount: { increment: 1 },
                    lastReminderAt: new Date(),
                },
            })

            results.sent++
        } catch (error) {
            await prisma.reminderSchedule.update({
                where: { id: reminder.id },
                data: {
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
            })
            results.failed++
        }
    }

    return results
}

async function sendReminderEmail(reminder: {
    id: string
    reminderType: string
    invoice: {
        id: string
        invoiceNumber: string
        total: number
        amountPaid: number
        dueDate: Date
        stripePaymentLinkUrl: string | null
        client: {
            name: string
            email: string
        }
        user: {
            firstName: string | null
            lastName: string | null
            businessName: string | null
            email: string
        }
    }
}) {
    const { invoice } = reminder
    const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    const freelancerName = invoice.user.businessName ||
        `${invoice.user.firstName} ${invoice.user.lastName}`

    const emailData: ReminderEmailData = {
        invoiceNumber: invoice.invoiceNumber,
        invoiceId: invoice.id,
        clientName: invoice.client.name,
        clientEmail: invoice.client.email,
        freelancerName,
        freelancerEmail: invoice.user.email,
        amount: invoice.total - invoice.amountPaid,
        dueDate: invoice.dueDate,
        daysOverdue: Math.max(0, daysOverdue),
        paymentLink: invoice.stripePaymentLinkUrl ||
            `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`,
        invoiceLink: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}`,
    }

    const reminderType = reminder.reminderType as ReminderType
    const subject = getSubjectLine(reminderType, emailData)
    const html = getReminderTemplate(reminderType, emailData)

    const result = await sendEmail({
        to: invoice.client.email,
        subject,
        html,
        replyTo: invoice.user.email,
        tags: [
            { name: 'type', value: 'reminder' },
            { name: 'reminder_type', value: reminderType },
            { name: 'invoice_id', value: invoice.id },
        ],
    })

    if (!result.success) {
        throw new Error(result.error || 'Failed to send email')
    }

    // Update reminder with email ID
    await prisma.reminderSchedule.update({
        where: { id: reminder.id },
        data: { emailId: result.id },
    })

    return result
}

export async function cancelRemindersForInvoice(invoiceId: string) {
    await prisma.reminderSchedule.updateMany({
        where: {
            invoiceId,
            status: 'scheduled',
        },
        data: {
            status: 'cancelled',
        },
    })
}
