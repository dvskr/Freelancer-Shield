"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, PenLine, Copy, Check, Loader2, ExternalLink } from 'lucide-react'

interface ContractActionsProps {
    contractId: string
    contractCode: string
    status: string
    freelancerSignedAt: Date | null
}

export default function ContractActions({
    contractId,
    contractCode,
    status,
    freelancerSignedAt
}: ContractActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [showSignModal, setShowSignModal] = useState(false)
    const [signature, setSignature] = useState('')

    const signingLink = `${process.env.NEXT_PUBLIC_APP_URL || ''}/sign/${contractId}?code=${contractCode}`

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(signingLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleFreelancerSign = async () => {
        if (!signature.trim()) return

        setLoading('sign')
        try {
            const res = await fetch(`/api/contracts/${contractId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ freelancerSignature: signature }),
            })

            if (res.ok) {
                setShowSignModal(false)
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to sign:', err)
        } finally {
            setLoading(null)
        }
    }

    const handleSendToClient = async () => {
        setLoading('send')
        try {
            const res = await fetch(`/api/contracts/${contractId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'sent' }),
            })

            if (res.ok) {
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to send:', err)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
                {/* Sign as Freelancer */}
                {!freelancerSignedAt && (
                    <button
                        onClick={() => setShowSignModal(true)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        <PenLine className="w-4 h-4" />
                        Sign as Freelancer
                    </button>
                )}

                {/* Send to Client */}
                {status === 'draft' && freelancerSignedAt && (
                    <button
                        onClick={handleSendToClient}
                        disabled={loading === 'send'}
                        className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {loading === 'send' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Send to Client
                            </>
                        )}
                    </button>
                )}

                {/* Copy Signing Link */}
                {status === 'sent' && (
                    <>
                        <button
                            onClick={handleCopyLink}
                            className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-600" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy Signing Link
                                </>
                            )}
                        </button>

                        <a
                            href={signingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Preview Client View
                        </a>
                    </>
                )}

                {status === 'signed' && (
                    <div className="text-center py-4">
                        <Check className="w-8 h-8 mx-auto text-green-500 mb-2" />
                        <p className="text-sm text-gray-600">Contract fully signed!</p>
                    </div>
                )}
            </div>

            {/* Sign Modal */}
            {showSignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign Contract</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Enter your signature below. This will be used as your legal signature on the contract.
                        </p>
                        <input
                            type="text"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder="Type your full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-xl italic text-gray-900 placeholder:text-gray-400"
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowSignModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFreelancerSign}
                                disabled={!signature.trim() || loading === 'sign'}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                {loading === 'sign' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing...
                                    </>
                                ) : (
                                    'Sign Contract'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
