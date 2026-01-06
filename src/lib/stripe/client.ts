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

// Redirect to Stripe Checkout session URL
export function redirectToCheckout(sessionUrl: string) {
    window.location.href = sessionUrl
}

