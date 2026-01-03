"use client"

import { useState } from 'react'
import { CreditCard, Loader2, Lock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PaymentFormProps {
    invoiceId: string
    amount: number
}

export default function PaymentForm({ invoiceId, amount }: PaymentFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handlePayment = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/invoices/${invoiceId}/checkout`, {
                method: 'POST',
            })

            const data = await res.json()

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url
            } else if (data.error) {
                setError(data.error)
            }
        } catch (err) {
            setError('Failed to initiate payment. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                Secured by Stripe
            </div>
        </div>
    )
}
