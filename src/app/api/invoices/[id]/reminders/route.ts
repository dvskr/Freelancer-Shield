import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email/resend'
import { getReminderTemplate, getSubjectLine } from '@/lib/email/templates/reminders'
import { ReminderType, ReminderEmailData } from '@/lib/email/types'
import { scheduleRemindersForInvoice, cancelRemindersForInvoice } from '@/lib/reminders/scheduler'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Get reminder history for an invoice
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id, userId: profile.id },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        const reminders = await prisma.reminderSchedule.findMany({
            where: { invoiceId: id },
            orderBy: { scheduledFor: 'asc' },
        })

        return NextResponse.json(reminders)
    } catch (error) {
        console.error('Reminders GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Send a manual reminder
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id, userId: profile.id },
            include: { client: true },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        const body = await request.json()
        const { reminderType = 'overdue_gentle' } = body

        // Calculate days overdue
        const daysOverdue = Math.floor(
            (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        )

        const freelancerName = profile.businessName ||
            `${profile.firstName} ${profile.lastName}`

        const emailData: ReminderEmailData = {
            invoiceNumber: invoice.invoiceNumber,
            invoiceId: invoice.id,
            clientName: invoice.client.name,
            clientEmail: invoice.client.email,
            freelancerName,
            freelancerEmail: profile.email,
            amount: invoice.total - invoice.amountPaid,
            dueDate: invoice.dueDate,
            daysOverdue: Math.max(0, daysOverdue),
            paymentLink: invoice.stripePaymentLinkUrl ||
                `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`,
            invoiceLink: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}`,
        }

        const subject = getSubjectLine(reminderType as ReminderType, emailData)
        const html = getReminderTemplate(reminderType as ReminderType, emailData)

        const result = await sendEmail({
            to: invoice.client.email,
            subject,
            html,
            replyTo: profile.email,
            tags: [
                { name: 'type', value: 'reminder' },
                { name: 'reminder_type', value: reminderType },
                { name: 'invoice_id', value: invoice.id },
                { name: 'manual', value: 'true' },
            ],
        })

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 })
        }

        // Log the reminder
        await prisma.reminderSchedule.create({
            data: {
                userId: profile.id,
                invoiceId: invoice.id,
                reminderType,
                daysOffset: daysOverdue,
                scheduledFor: new Date(),
                status: 'sent',
                sentAt: new Date(),
                emailId: result.id,
            },
        })

        // Update invoice reminder count
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                reminderCount: { increment: 1 },
                lastReminderAt: new Date(),
            },
        })

        return NextResponse.json({ success: true, emailId: result.id })
    } catch (error) {
        console.error('Manual reminder error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Cancel all pending reminders
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id, userId: profile.id },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        await cancelRemindersForInvoice(id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Cancel reminders error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT - Reschedule reminders
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id, userId: profile.id },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        const count = await scheduleRemindersForInvoice(id)

        return NextResponse.json({ success: true, scheduledCount: count })
    } catch (error) {
        console.error('Reschedule reminders error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
