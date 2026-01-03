"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, X, Mail, Check } from 'lucide-react'

interface SendInvoiceButtonProps {
    invoiceId: string
    clientEmail: string
}

export default function SendInvoiceButton({ invoiceId, clientEmail }: SendInvoiceButtonProps) {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSend = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/invoices/${invoiceId}/send`, {
                method: 'POST',
            })

            if (!res.ok) {
                throw new Error('Failed to send invoice')
            }

            setSent(true)
            setTimeout(() => {
                setShowModal(false)
                router.refresh()
            }, 1500)
        } catch (err) {
            setError('Failed to send invoice. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                <Send className="w-4 h-4" />
                Send Invoice
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                        {sent ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Invoice Sent!</h3>
                                <p className="text-gray-500 mt-2">
                                    The invoice has been sent to {clientEmail}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Send Invoice</h3>
                                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Sending to:</p>
                                            <p className="font-medium text-gray-900">{clientEmail}</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-6">
                                    The client will receive an email with a link to view and pay this invoice.
                                </p>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        disabled={loading}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Invoice
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
