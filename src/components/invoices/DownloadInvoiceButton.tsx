"use client"

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface DownloadInvoiceButtonProps {
    invoiceId: string
}

export default function DownloadInvoiceButton({ invoiceId }: DownloadInvoiceButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/invoices/${invoiceId}/pdf`)

            if (!res.ok) {
                throw new Error('Failed to generate PDF')
            }

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `invoice-${invoiceId}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Download failed:', err)
            alert('Failed to download invoice. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    Download PDF
                </>
            )}
        </button>
    )
}
