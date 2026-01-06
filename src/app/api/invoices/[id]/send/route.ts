import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email/resend'
import { invoiceSentTemplate } from '@/lib/email/templates/invoice'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        const { id } = await params

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
            include: {
                client: true,
                project: { select: { name: true } },
            },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Update invoice status
        const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: {
                status: 'sent',
                sentAt: new Date(),
            },
        })

        // Build URLs for payment and viewing
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const paymentLink = `${baseUrl}/pay/${invoice.id}`
        const invoiceLink = `${baseUrl}/api/invoices/${invoice.id}/pdf`

        // Get freelancer display name
        const freelancerName = profile.businessName ||
            `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
            'Your Freelancer'

        // Calculate amount due
        const amountDue = invoice.total - invoice.amountPaid

        // SEND THE EMAIL
        const emailResult = await sendEmail({
            to: invoice.client.email,
            subject: `Invoice ${invoice.invoiceNumber} from ${freelancerName}`,
            html: invoiceSentTemplate({
                invoiceNumber: invoice.invoiceNumber,
                clientName: invoice.client.name,
                freelancerName,
                amount: amountDue,
                dueDate: invoice.dueDate,
                paymentLink,
                invoiceLink,
                projectName: invoice.project?.name,
            }),
            replyTo: profile.email,
        })

        if (!emailResult.success) {
            console.error('Failed to send invoice email:', emailResult.error)
            // Invoice is still marked as sent - log error for monitoring
        }

        return NextResponse.json({
            ...updatedInvoice,
            emailSent: emailResult.success,
        })
    } catch (error) {
        console.error('Invoice send error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
