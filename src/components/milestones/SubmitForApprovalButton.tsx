"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2 } from 'lucide-react'

interface SubmitForApprovalButtonProps {
    projectId: string
    milestoneId: string
}

export default function SubmitForApprovalButton({
    projectId,
    milestoneId
}: SubmitForApprovalButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!confirm('Submit this milestone for client approval?')) return

        setLoading(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'pending_approval' }),
            })

            if (res.ok) {
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to submit for approval:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                </>
            ) : (
                <>
                    <Send className="w-4 h-4" />
                    Submit for Approval
                </>
            )}
        </button>
    )
}
