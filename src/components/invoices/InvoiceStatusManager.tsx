"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

interface InvoiceStatusManagerProps {
    invoiceId: string
    currentStatus: string
}

const statusTransitions: Record<string, string[]> = {
    draft: ['sent', 'cancelled'],
    sent: ['viewed', 'paid', 'overdue', 'cancelled'],
    viewed: ['paid', 'overdue', 'cancelled'],
    overdue: ['paid', 'cancelled'],
    paid: [],
    cancelled: ['draft'],
}

const statusLabels: Record<string, string> = {
    draft: 'Draft',
    sent: 'Mark as Sent',
    viewed: 'Mark as Viewed',
    paid: 'Mark as Paid',
    overdue: 'Mark as Overdue',
    cancelled: 'Cancel Invoice',
}

export default function InvoiceStatusManager({
    invoiceId,
    currentStatus
}: InvoiceStatusManagerProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const availableTransitions = statusTransitions[currentStatus] || []

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === 'cancelled' && !confirm('Cancel this invoice? This action cannot be undone.')) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/invoices/${invoiceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!res.ok) {
                throw new Error('Failed to update status')
            }

            router.refresh()
        } catch (err) {
            setError('Failed to update status')
        } finally {
            setLoading(false)
        }
    }

    if (availableTransitions.length === 0) {
        return null
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div className="space-y-2">
                {availableTransitions.map((status) => (
                    <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={loading}
                        className={`w-full px-4 py-2.5 rounded-lg font-medium text-left transition-all ${status === 'cancelled'
                                ? 'text-red-600 hover:bg-red-50 border border-red-200'
                                : status === 'paid'
                                    ? 'text-green-600 hover:bg-green-50 border border-green-200'
                                    : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                        {statusLabels[status]}
                    </button>
                ))}
            </div>
        </div>
    )
}
