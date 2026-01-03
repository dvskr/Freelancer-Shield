"use client"

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

interface PortalPaymentButtonProps {
    invoiceId: string
    amount: number
    paymentLinkUrl?: string | null
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100)
}

export default function PortalPaymentButton({
    invoiceId,
    amount,
    paymentLinkUrl
}: PortalPaymentButtonProps) {
    const [loading, setLoading] = useState(false)

    const handlePayment = async () => {
        // If we have a payment link, use that
        if (paymentLinkUrl) {
            window.location.href = paymentLinkUrl
            return
        }

        // Otherwise create a checkout session
        setLoading(true)
        try {
            const res = await fetch(`/api/portal/invoices/${invoiceId}/checkout`, {
                method: 'POST',
            })
            const data = await res.json()

            if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error('Payment failed:', err)
            alert('Failed to initiate payment. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <CreditCard className="w-5 h-5" />
                    Pay {formatCurrency(amount)}
                </>
            )}
        </button>
    )
}
