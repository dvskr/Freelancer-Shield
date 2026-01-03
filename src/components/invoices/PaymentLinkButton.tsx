"use client"

import { useState } from 'react'
import {
    Link2,
    Copy,
    Check,
    Loader2,
    ExternalLink,
    QrCode,
    X
} from 'lucide-react'

interface PaymentLinkButtonProps {
    invoiceId: string
    existingUrl?: string | null
}

export default function PaymentLinkButton({
    invoiceId,
    existingUrl
}: PaymentLinkButtonProps) {
    const [loading, setLoading] = useState(false)
    const [paymentUrl, setPaymentUrl] = useState(existingUrl || '')
    const [copied, setCopied] = useState(false)
    const [showQR, setShowQR] = useState(false)
    const [qrDataUrl, setQrDataUrl] = useState('')

    const handleGenerateLink = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/invoices/${invoiceId}/payment-link`, {
                method: 'POST',
            })
            const data = await res.json()

            if (data.url) {
                setPaymentUrl(data.url)
            } else if (data.error) {
                alert(data.error)
            }
        } catch (err) {
            console.error('Failed to generate payment link:', err)
            alert('Failed to generate payment link')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(paymentUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShowQR = async () => {
        try {
            // Dynamic import for QRCode
            const QRCode = (await import('qrcode')).default
            const dataUrl = await QRCode.toDataURL(paymentUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            })
            setQrDataUrl(dataUrl)
            setShowQR(true)
        } catch (err) {
            console.error('Failed to generate QR code:', err)
        }
    }

    if (!paymentUrl) {
        return (
            <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Link2 className="w-4 h-4" />
                        Create Payment Link
                    </>
                )}
            </button>
        )
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-600 truncate max-w-[200px]">
                        {paymentUrl}
                    </span>
                </div>

                <button
                    onClick={handleCopy}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Copy link"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                    ) : (
                        <Copy className="w-4 h-4" />
                    )}
                </button>

                <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Open link"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>

                <button
                    onClick={handleShowQR}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Show QR code"
                >
                    <QrCode className="w-4 h-4" />
                </button>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Payment QR Code</h3>
                            <button onClick={() => setShowQR(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex justify-center mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qrDataUrl} alt="Payment QR Code" className="w-64 h-64" />
                        </div>

                        <p className="text-sm text-gray-500 text-center">
                            Client can scan this code to pay
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
