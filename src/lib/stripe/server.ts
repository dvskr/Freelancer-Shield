import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
})

// Helper to format amount for Stripe (cents)
export function formatAmountForStripe(amount: number): number {
    return Math.round(amount) // Already in cents from our DB
}

// Helper to format Stripe amount for display (dollars)
export function formatAmountFromStripe(amount: number): number {
    return amount // Already in cents, our formatCurrency handles it
}

// Create a payment intent
export async function createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
) {
    return stripe.paymentIntents.create({
        amount: formatAmountForStripe(amount),
        currency,
        metadata,
        automatic_payment_methods: {
            enabled: true,
        },
    })
}

// Create a checkout session for invoice payment
export async function createInvoiceCheckoutSession({
    invoiceId,
    amount,
    customerEmail,
    invoiceNumber,
    description,
    successUrl,
    cancelUrl,
    metadata,
}: {
    invoiceId: string
    amount: number
    customerEmail: string
    invoiceNumber: string
    description: string
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
}) {
    return stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customerEmail,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Invoice ${invoiceNumber}`,
                        description,
                    },
                    unit_amount: formatAmountForStripe(amount),
                },
                quantity: 1,
            },
        ],
        metadata: {
            invoiceId,
            invoiceNumber,
            ...metadata,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        payment_intent_data: {
            metadata: {
                invoiceId,
                invoiceNumber,
            },
        },
    })
}

// Create a payment link for an invoice
export async function createPaymentLink({
    invoiceId,
    amount,
    invoiceNumber,
    description,
}: {
    invoiceId: string
    amount: number
    invoiceNumber: string
    description: string
}) {
    // First create a product
    const product = await stripe.products.create({
        name: `Invoice ${invoiceNumber}`,
        description,
        metadata: {
            invoiceId,
        },
    })

    // Then create a price
    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: formatAmountForStripe(amount),
        currency: 'usd',
    })

    // Finally create the payment link
    const paymentLink = await stripe.paymentLinks.create({
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        metadata: {
            invoiceId,
            invoiceNumber,
        },
        after_completion: {
            type: 'redirect',
            redirect: {
                url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceId}/thank-you`,
            },
        },
    })

    return paymentLink
}

// Retrieve a checkout session
export async function retrieveCheckoutSession(sessionId: string) {
    return stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent', 'line_items'],
    })
}

// Retrieve a payment intent
export async function retrievePaymentIntent(paymentIntentId: string) {
    return stripe.paymentIntents.retrieve(paymentIntentId)
}
