import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { createInvoiceCheckoutSession } from '@/lib/stripe/server'

interface RouteParams {
    params: Promise<{ id: string }>
}

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
            include: {
                client: true,
                project: true,
            },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        if (invoice.status === 'paid') {
            return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
        }

        const balanceDue = invoice.total - invoice.amountPaid

        if (balanceDue <= 0) {
            return NextResponse.json({ error: 'No balance due' }, { status: 400 })
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL

        const session = await createInvoiceCheckoutSession({
            invoiceId: invoice.id,
            amount: balanceDue,
            customerEmail: invoice.client.email,
            invoiceNumber: invoice.invoiceNumber,
            description: invoice.project
                ? `Payment for ${invoice.project.name}`
                : `Invoice ${invoice.invoiceNumber}`,
            successUrl: `${baseUrl}/invoices/${invoice.id}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${baseUrl}/pay/${invoice.id}`,
            metadata: {
                userId: profile.id,
                clientId: invoice.clientId,
            },
        })

        // Save session ID
        await prisma.invoice.update({
            where: { id },
            data: { stripeCheckoutSessionId: session.id },
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error) {
        console.error('Checkout session error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
