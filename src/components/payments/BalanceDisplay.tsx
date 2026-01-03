"use client"

import { useState, useEffect } from 'react'
import {
    Wallet,
    Clock,
    ArrowDownRight,
    RefreshCw,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Balance {
    amount: number
    currency: string
}

interface Payout {
    id: string
    amount: number
    currency: string
    status: string
    arrivalDate: string
    createdAt: string
}

interface BalanceData {
    available: Balance[]
    pending: Balance[]
    payouts: Payout[]
}

function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export default function BalanceDisplay() {
    const [data, setData] = useState<BalanceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchBalance = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/balance')
            if (!res.ok) {
                throw new Error('Failed to fetch balance')
            }
            const balanceData = await res.json()
            setData(balanceData)
            setError(null)
        } catch (err) {
            setError('Unable to load balance')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBalance()
    }, [])

    const getPayoutStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'pending':
            case 'in_transit':
                return <Clock className="w-4 h-4 text-blue-600" />
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-600" />
            default:
                return <Clock className="w-4 h-4 text-gray-400" />
        }
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    <span className="text-gray-500">Loading balance...</span>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-gray-500">{error || 'Unable to load balance'}</p>
            </div>
        )
    }

    const availableAmount = data.available.reduce((sum, b) => sum + b.amount, 0)
    const pendingAmount = data.pending.reduce((sum, b) => sum + b.amount, 0)

    return (
        <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Wallet className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-500">Available</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(availableAmount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Ready for payout</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-500">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(pendingAmount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Processing</p>
                </div>
            </div>

            {/* Recent Payouts */}
            {data.payouts.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Recent Payouts</h3>
                        <button
                            onClick={fetchBalance}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {data.payouts.map((payout) => (
                            <div key={payout.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ArrowDownRight className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {formatCurrency(payout.amount)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(payout.arrivalDate)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getPayoutStatusIcon(payout.status)}
                                    <span className="text-sm text-gray-500 capitalize">
                                        {payout.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
