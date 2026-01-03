"use client"

import { useState } from 'react'
import { ExternalLink, Copy, RefreshCw, Loader2, Check } from 'lucide-react'

interface GeneratePortalLinkProps {
    clientId: string
    existingToken: string | null
}

export default function GeneratePortalLink({ clientId, existingToken }: GeneratePortalLinkProps) {
    const [token, setToken] = useState(existingToken)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const portalUrl = token
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${token}`
        : null

    const generateToken = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/clients/${clientId}/portal-token`, {
                method: 'POST',
            })

            if (!res.ok) {
                throw new Error('Failed to generate token')
            }

            const data = await res.json()
            setToken(data.portalToken)
        } catch (err) {
            setError('Failed to generate portal link')
        } finally {
            setLoading(false)
        }
    }

    const copyLink = async () => {
        if (!portalUrl) return

        try {
            await navigator.clipboard.writeText(portalUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            setError('Failed to copy link')
        }
    }

    if (!token) {
        return (
            <div>
                <button
                    onClick={generateToken}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <ExternalLink className="w-4 h-4" />
                            Generate Portal Link
                        </>
                    )}
                </button>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 truncate max-w-md font-mono">
                {portalUrl}
            </div>
            <button
                onClick={copyLink}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy link"
            >
                {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                ) : (
                    <Copy className="w-5 h-5" />
                )}
            </button>
            <button
                onClick={generateToken}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Regenerate link"
            >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a
                href={portalUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Open portal"
            >
                <ExternalLink className="w-5 h-5" />
            </a>
        </div>
    )
}
