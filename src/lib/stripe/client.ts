import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
    if (!stripePromise) {
        stripePromise = loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
        )
    }
    return stripePromise
}

// Redirect to Stripe Checkout
export async function redirectToCheckout(sessionId: string) {
    const stripe = await getStripe()
    if (!stripe) {
        throw new Error('Stripe not loaded')
    }

    const { error } = await stripe.redirectToCheckout({ sessionId })
    if (error) {
        throw error
    }
}
