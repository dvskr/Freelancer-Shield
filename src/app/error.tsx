"use client"

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Global error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Oops! Something went wrong
                </h1>
                <p className="text-gray-600 mb-2">
                    We&apos;re sorry, but something unexpected happened.
                </p>
                {error.digest && (
                    <p className="text-xs text-gray-400 mb-6">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-white font-medium text-gray-700"
                    >
                        <Home className="w-4 h-4" />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
