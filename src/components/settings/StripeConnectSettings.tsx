"use client"

import { useState, useEffect } from 'react'
import {
    CreditCard,
    ExternalLink,
    CheckCircle,
    AlertCircle,
    Clock,
    Loader2,
    RefreshCw,
    Building
} from 'lucide-react'

interface StripeStatus {
    connected: boolean
    status: 'not_connected' | 'pending' | 'restricted' | 'active'
    detailsSubmitted?: boolean
    chargesEnabled?: boolean
    payoutsEnabled?: boolean
    requirements?: {
        currently_due: string[]
        eventually_due: string[]
        pending_verification: string[]
    }
}

export default function StripeConnectSettings() {
    const [status, setStatus] = useState<StripeStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [connecting, setConnecting] = useState(false)

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/stripe/connect')
            const data = await res.json()
            setStatus(data)
        } catch (err) {
            console.error('Failed to fetch Stripe status:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    const handleConnect = async () => {
        setConnecting(true)
        try {
            const res = await fetch('/api/stripe/connect', { method: 'POST' })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error('Failed to start Stripe connect:', err)
        } finally {
            setConnecting(false)
        }
    }

    const handleDashboard = async () => {
        try {
            const res = await fetch('/api/stripe/connect/dashboard')
            const data = await res.json()
            if (data.url) {
                window.open(data.url, '_blank')
            }
        } catch (err) {
            console.error('Failed to open Stripe dashboard:', err)
        }
    }

    const getStatusIcon = () => {
        if (!status?.connected) return <CreditCard className="w-6 h-6 text-gray-400" />
        switch (status.status) {
            case 'active':
                return <CheckCircle className="w-6 h-6 text-green-600" />
            case 'restricted':
                return <AlertCircle className="w-6 h-6 text-yellow-600" />
            default:
                return <Clock className="w-6 h-6 text-blue-600" />
        }
    }

    const getStatusBadge = () => {
        if (!status?.connected) return null
        const colors = {
            active: 'bg-green-100 text-green-700',
            restricted: 'bg-yellow-100 text-yellow-700',
            pending: 'bg-blue-100 text-blue-700',
            not_connected: 'bg-gray-100 text-gray-700',
        }
        return (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colors[status.status] || 'bg-gray-100'}`}>
                {status.status.charAt(0).toUpperCase() + status.status.slice(1).replace('_', ' ')}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    <span className="text-gray-500">Loading payment settings...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                            {getStatusIcon()}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-900">Stripe Payments</h3>
                                {getStatusBadge()}
                            </div>
                            <p className="text-gray-500 mt-1">
                                {!status?.connected && 'Connect your Stripe account to accept payments'}
                                {status?.status === 'pending' && 'Complete your Stripe onboarding to start accepting payments'}
                                {status?.status === 'restricted' && 'Additional verification required'}
                                {status?.status === 'active' && 'Your account is ready to accept payments'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchStatus}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Status Details */}
                {status?.connected && (
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className={`p-3 rounded-lg ${status.detailsSubmitted ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2">
                                {status.detailsSubmitted ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Clock className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm font-medium text-gray-700">Details Submitted</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${status.chargesEnabled ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2">
                                {status.chargesEnabled ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Clock className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm font-medium text-gray-700">Charges Enabled</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${status.payoutsEnabled ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2">
                                {status.payoutsEnabled ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Clock className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm font-medium text-gray-700">Payouts Enabled</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Requirements */}
                {status?.requirements?.currently_due && status.requirements.currently_due.length > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">Action Required</h4>
                        <p className="text-sm text-yellow-700">
                            Please complete your Stripe onboarding to enable payments.
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                {!status?.connected ? (
                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {connecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CreditCard className="w-4 h-4" />
                        )}
                        Connect Stripe
                    </button>
                ) : status.status !== 'active' ? (
                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {connecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ExternalLink className="w-4 h-4" />
                        )}
                        Complete Onboarding
                    </button>
                ) : (
                    <button
                        onClick={handleDashboard}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        <Building className="w-4 h-4" />
                        Open Stripe Dashboard
                    </button>
                )}
            </div>
        </div>
    )
}
