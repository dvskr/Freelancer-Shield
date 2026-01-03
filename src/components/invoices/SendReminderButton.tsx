"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Bell,
    Loader2,
    X,
    Check,
    Send,
    AlertTriangle
} from 'lucide-react'
import { ReminderType } from '@/lib/email/types'

interface SendReminderButtonProps {
    invoiceId: string
    daysOverdue: number
}

const reminderOptions: { type: ReminderType; label: string; description: string }[] = [
    { type: 'overdue_gentle', label: 'Friendly Reminder', description: 'Polite follow-up' },
    { type: 'overdue_firm', label: 'Firm Reminder', description: 'Request action' },
    { type: 'overdue_final', label: 'Final Notice', description: 'Strong warning' },
    { type: 'overdue_urgent', label: 'Urgent Notice', description: 'Collection warning' },
]

export default function SendReminderButton({
    invoiceId,
    daysOverdue
}: SendReminderButtonProps) {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)
    const [selectedType, setSelectedType] = useState<ReminderType>('overdue_gentle')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Suggest appropriate reminder based on days overdue
    const suggestedType: ReminderType =
        daysOverdue >= 30 ? 'overdue_urgent' :
            daysOverdue >= 14 ? 'overdue_final' :
                daysOverdue >= 7 ? 'overdue_firm' :
                    'overdue_gentle'

    const handleSend = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/invoices/${invoiceId}/reminders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reminderType: selectedType }),
            })

            if (!res.ok) {
                throw new Error('Failed to send reminder')
            }

            setSent(true)
            setTimeout(() => {
                setShowModal(false)
                setSent(false)
                router.refresh()
            }, 1500)
        } catch (err) {
            setError('Failed to send reminder. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100"
            >
                <Bell className="w-4 h-4" />
                Send Reminder
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                        {sent ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Reminder Sent!</h3>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Send Payment Reminder</h3>
                                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Choose the tone of your reminder. The invoice is {daysOverdue} days overdue.
                                    </p>

                                    <div className="space-y-2">
                                        {reminderOptions.map((option) => (
                                            <button
                                                key={option.type}
                                                onClick={() => setSelectedType(option.type)}
                                                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${selectedType === option.type
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{option.label}</p>
                                                        <p className="text-sm text-gray-500">{option.description}</p>
                                                    </div>
                                                    {option.type === suggestedType && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                            Suggested
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedType === 'overdue_urgent' && (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-yellow-700">
                                            This is a strong collection notice. Use only when necessary.
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
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
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Reminder
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
