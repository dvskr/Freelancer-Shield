"use client"

import { useState, useEffect } from 'react'
import {
    Bell,
    Check,
    X,
    Clock,
    Loader2,
    RefreshCw,
    Mail,
    AlertCircle
} from 'lucide-react'

interface Reminder {
    id: string
    reminderType: string
    status: string
    scheduledFor: string
    sentAt: string | null
    error: string | null
}

interface ReminderHistoryProps {
    invoiceId: string
}

function formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date)
}

export default function ReminderHistory({ invoiceId }: ReminderHistoryProps) {
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [loading, setLoading] = useState(true)

    const fetchReminders = async () => {
        try {
            const res = await fetch(`/api/invoices/${invoiceId}/reminders`)
            const data = await res.json()
            setReminders(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to fetch reminders:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReminders()
    }, [invoiceId])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'sent':
                return <Check className="w-4 h-4 text-green-600" />
            case 'failed':
                return <X className="w-4 h-4 text-red-600" />
            case 'cancelled':
                return <X className="w-4 h-4 text-gray-400" />
            default:
                return <Clock className="w-4 h-4 text-blue-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent':
                return 'bg-green-100 text-green-700'
            case 'failed':
                return 'bg-red-100 text-red-700'
            case 'cancelled':
                return 'bg-gray-100 text-gray-500'
            default:
                return 'bg-blue-100 text-blue-700'
        }
    }

    const getReminderLabel = (type: string) => {
        const labels: Record<string, string> = {
            upcoming_due: 'Upcoming Due',
            due_today: 'Due Today',
            overdue_gentle: 'Gentle Reminder',
            overdue_firm: 'Firm Reminder',
            overdue_final: 'Final Notice',
            overdue_urgent: 'Urgent Notice',
        }
        return labels[type] || type
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    <span className="text-gray-500">Loading reminder history...</span>
                </div>
            </div>
        )
    }

    if (reminders.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reminders scheduled</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-400" />
                    Reminder History
                </h3>
                <button
                    onClick={fetchReminders}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="divide-y divide-gray-100">
                {reminders.map((reminder) => (
                    <div key={reminder.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Mail className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {getReminderLabel(reminder.reminderType)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {reminder.status === 'sent' && reminder.sentAt
                                        ? `Sent ${formatDateTime(new Date(reminder.sentAt))}`
                                        : reminder.status === 'scheduled'
                                            ? `Scheduled for ${formatDateTime(new Date(reminder.scheduledFor))}`
                                            : reminder.status === 'cancelled'
                                                ? 'Cancelled'
                                                : 'Failed'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(reminder.status)}`}>
                                {getStatusIcon(reminder.status)}
                                {reminder.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Error details */}
            {reminders.some(r => r.error) && (
                <div className="p-4 bg-red-50 border-t border-red-100">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800">Some reminders failed</p>
                            {reminders.filter(r => r.error).map(r => (
                                <p key={r.id} className="text-sm text-red-600 mt-1">
                                    {getReminderLabel(r.reminderType)}: {r.error}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
