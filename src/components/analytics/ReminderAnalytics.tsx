"use client"

import { useState, useEffect } from 'react'
import {
    Bell,
    TrendingUp,
    Mail,
    Loader2,
    CheckCircle,
    XCircle
} from 'lucide-react'

interface Analytics {
    stats: {
        total: number
        sent: number
        failed: number
        pending: number
        cancelled: number
    }
    effectiveness: number
    byType: Record<string, number>
    period: string
}

export default function ReminderAnalytics() {
    const [data, setData] = useState<Analytics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/analytics/reminders')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    <span className="text-gray-500">Loading analytics...</span>
                </div>
            </div>
        )
    }

    if (!data) {
        return null
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-400" />
                    Reminder Performance
                </h3>
                <p className="text-sm text-gray-500 mt-1">Last {data.period}</p>
            </div>

            <div className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <Mail className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{data.stats.total}</p>
                        <p className="text-sm text-gray-500">Total Reminders</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">{data.stats.sent}</p>
                        <p className="text-sm text-gray-500">Sent</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                        <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-600">{data.stats.failed}</p>
                        <p className="text-sm text-gray-500">Failed</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">{data.effectiveness}%</p>
                        <p className="text-sm text-gray-500">Effectiveness</p>
                    </div>
                </div>

                {/* Effectiveness Explanation */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                        <strong>{data.effectiveness}%</strong> of sent reminders resulted in payment within 7 days.
                    </p>
                </div>
            </div>
        </div>
    )
}
