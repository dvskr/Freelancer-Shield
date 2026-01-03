"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface DeliverableApprovalProps {
    projectId: string
    milestoneId: string
    deliverableId: string
    currentStatus: string
}

export default function DeliverableApproval({
    projectId,
    milestoneId,
    deliverableId,
    currentStatus,
}: DeliverableApprovalProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    if (currentStatus === 'approved') {
        return (
            <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                Approved
            </span>
        )
    }

    const handleApprove = async () => {
        setLoading(true)
        try {
            const res = await fetch(
                `/api/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'approved' }),
                }
            )
            if (res.ok) {
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to approve:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleReject = async () => {
        setLoading(true)
        try {
            const res = await fetch(
                `/api/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'rejected' }),
                }
            )
            if (res.ok) {
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to reject:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleApprove}
                disabled={loading}
                className="p-1.5 text-gray-400 hover:text-green-600 rounded"
                title="Approve"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <CheckCircle className="w-4 h-4" />
                )}
            </button>
            <button
                onClick={handleReject}
                disabled={loading}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                title="Request Revision"
            >
                <XCircle className="w-4 h-4" />
            </button>
        </div>
    )
}
