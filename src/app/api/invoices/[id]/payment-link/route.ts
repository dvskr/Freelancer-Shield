import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { createPaymentLink } from '@/lib/stripe/server'

interface RouteParams {
    params: Promise<{ id: string }>
}

// POST - Create a payment link for an invoice
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
            select: {
                id: true,
                stripeAccountId: true,
                stripeChargesEnabled: true
            },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        if (!profile.stripeChargesEnabled) {
            return NextResponse.json(
                { error: 'Stripe account not ready for payments' },
                { status: 400 }
            )
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id, userId: profile.id },
            include: { client: true },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        if (invoice.status === 'paid') {
            return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
        }

        // Calculate balance due
        const balanceDue = invoice.total - invoice.amountPaid

        if (balanceDue <= 0) {
            return NextResponse.json({ error: 'No balance due' }, { status: 400 })
        }

        // Check if we already have a payment link
        if (invoice.stripePaymentLinkId && invoice.stripePaymentLinkUrl) {
            return NextResponse.json({
                paymentLinkId: invoice.stripePaymentLinkId,
                url: invoice.stripePaymentLinkUrl,
                existing: true,
            })
        }

        // Create payment link
        const paymentLink = await createPaymentLink({
            invoiceId: invoice.id,
            amount: balanceDue,
            invoiceNumber: invoice.invoiceNumber,
            description: `Payment for Invoice ${invoice.invoiceNumber}`,
        })

        // Save to database
        await prisma.invoice.update({
            where: { id },
            data: {
                stripePaymentLinkId: paymentLink.id,
                stripePaymentLinkUrl: paymentLink.url,
            },
        })

        return NextResponse.json({
            paymentLinkId: paymentLink.id,
            url: paymentLink.url,
            existing: false,
        })
    } catch (error) {
        console.error('Payment link error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET - Get existing payment link
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
            select: {
                stripePaymentLinkId: true,
                stripePaymentLinkUrl: true,
            },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        return NextResponse.json({
            paymentLinkId: invoice.stripePaymentLinkId,
            url: invoice.stripePaymentLinkUrl,
        })
    } catch (error) {
        console.error('Get payment link error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
