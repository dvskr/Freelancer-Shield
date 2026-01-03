import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/server'
import prisma from '@/lib/prisma'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
                break

            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
                break

            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
                break

            case 'charge.refunded':
                await handleChargeRefunded(event.data.object as Stripe.Charge)
                break

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook handler error:', error)
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const invoiceId = session.metadata?.invoiceId

    if (!invoiceId) {
        console.error('No invoiceId in session metadata')
        return
    }

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
    })

    if (!invoice) {
        console.error('Invoice not found:', invoiceId)
        return
    }

    const amountPaid = session.amount_total || 0

    // Record payment
    await prisma.$transaction([
        prisma.payment.create({
            data: {
                invoiceId: invoice.id,
                amount: amountPaid,
                method: 'stripe',
                status: 'completed',
                stripePaymentIntentId: session.payment_intent as string,
                stripeSessionId: session.id,
                notes: `Stripe Checkout - ${session.customer_email}`,
            },
        }),
        prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                amountPaid: { increment: amountPaid },
                status: invoice.amountPaid + amountPaid >= invoice.total ? 'paid' : invoice.status,
                paidAt: invoice.amountPaid + amountPaid >= invoice.total ? new Date() : null,
            },
        }),
    ])

    console.log(`Payment recorded for invoice ${invoice.invoiceNumber}`)

    // TODO: Send payment confirmation email
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const invoiceId = paymentIntent.metadata?.invoiceId

    if (!invoiceId) {
        // Payment might not be for an invoice
        return
    }

    // Check if we already recorded this payment (via checkout.session.completed)
    const existingPayment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
    })

    if (existingPayment) {
        console.log('Payment already recorded for:', paymentIntent.id)
        return
    }

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
    })

    if (!invoice) {
        console.error('Invoice not found:', invoiceId)
        return
    }

    const amountPaid = paymentIntent.amount

    await prisma.$transaction([
        prisma.payment.create({
            data: {
                invoiceId: invoice.id,
                amount: amountPaid,
                method: 'stripe',
                status: 'completed',
                stripePaymentIntentId: paymentIntent.id,
                notes: 'Stripe Payment Intent',
            },
        }),
        prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                amountPaid: { increment: amountPaid },
                status: invoice.amountPaid + amountPaid >= invoice.total ? 'paid' : invoice.status,
                paidAt: invoice.amountPaid + amountPaid >= invoice.total ? new Date() : null,
            },
        }),
    ])
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const invoiceId = paymentIntent.metadata?.invoiceId

    if (!invoiceId) return

    // Log failed payment attempt
    await prisma.payment.create({
        data: {
            invoiceId,
            amount: paymentIntent.amount,
            method: 'stripe',
            status: 'failed',
            stripePaymentIntentId: paymentIntent.id,
            notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
        },
    })

    console.log(`Payment failed for invoice ${invoiceId}`)

    // TODO: Send payment failed notification
}

async function handleChargeRefunded(charge: Stripe.Charge) {
    const paymentIntentId = charge.payment_intent as string

    if (!paymentIntentId) return

    const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { invoice: true },
    })

    if (!payment) {
        console.error('Payment not found for refund:', paymentIntentId)
        return
    }

    const refundAmount = charge.amount_refunded

    await prisma.$transaction([
        prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: charge.refunded ? 'refunded' : 'partial_refund',
                notes: `${payment.notes} | Refunded: ${refundAmount}`,
            },
        }),
        prisma.invoice.update({
            where: { id: payment.invoiceId },
            data: {
                amountPaid: { decrement: refundAmount },
                status: payment.invoice.amountPaid - refundAmount < payment.invoice.total ? 'sent' : 'paid',
            },
        }),
    ])

    console.log(`Refund processed for payment ${payment.id}`)
}
