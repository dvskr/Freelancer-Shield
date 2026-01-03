"use client"

import {
    CheckCircle,
    Clock,
    XCircle,
    RefreshCw,
    AlertTriangle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Payment {
    id: string
    amount: number
    status: string
    method: string | null
    stripePaymentIntentId: string | null
    createdAt: Date
    notes: string | null
}

interface PaymentStatusProps {
    payments: Payment[]
    invoiceTotal: number
    amountPaid: number
}

function formatDateTime(date: Date) {
    return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}

export default function PaymentStatus({
    payments,
    invoiceTotal,
    amountPaid
}: PaymentStatusProps) {
    const balance = invoiceTotal - amountPaid
    const isPaid = balance <= 0

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
            case 'succeeded':
                return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-600" />
            case 'refunded':
                return <RefreshCw className="w-4 h-4 text-orange-600" />
            case 'partial_refund':
                return <AlertTriangle className="w-4 h-4 text-yellow-600" />
            default:
                return <Clock className="w-4 h-4 text-gray-400" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'succeeded':
                return 'bg-green-100 text-green-700'
            case 'failed':
                return 'bg-red-100 text-red-700'
            case 'refunded':
                return 'bg-orange-100 text-orange-700'
            case 'partial_refund':
                return 'bg-yellow-100 text-yellow-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Summary */}
            <div className={`p-4 ${isPaid ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <p className={`text-lg font-semibold ${isPaid ? 'text-green-700' : 'text-gray-900'}`}>
                            {isPaid ? 'Paid in Full' : `${formatCurrency(balance)} remaining`}
                        </p>
                    </div>
                    {isPaid && (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                {!isPaid && (
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{formatCurrency(amountPaid)} paid</span>
                            <span>{formatCurrency(invoiceTotal)} total</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${Math.min((amountPaid / invoiceTotal) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
                <div className="divide-y divide-gray-100">
                    {payments.map((payment) => (
                        <div key={payment.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {getStatusIcon(payment.status)}
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {formatCurrency(payment.amount)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {payment.method || 'Payment'} • {formatDateTime(payment.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                                {payment.status.replace('_', ' ')}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
