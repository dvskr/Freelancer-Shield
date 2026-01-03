import { CreditCard } from 'lucide-react'

interface StripePaymentBadgeProps {
    paymentIntentId?: string | null
    sessionId?: string | null
}

export default function StripePaymentBadge({
    paymentIntentId,
    sessionId
}: StripePaymentBadgeProps) {
    if (!paymentIntentId && !sessionId) {
        return null
    }

    const stripeUrl = paymentIntentId
        ? `https://dashboard.stripe.com/payments/${paymentIntentId}`
        : `https://dashboard.stripe.com/checkout/sessions/${sessionId}`

    return (
        <a
            href={stripeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200"
        >
            <CreditCard className="w-3 h-3" />
            View in Stripe
        </a>
    )
}
