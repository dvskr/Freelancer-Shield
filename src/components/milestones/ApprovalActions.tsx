"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, MessageSquare, X } from 'lucide-react'

interface ApprovalActionsProps {
    projectId: string
    milestoneId: string
    currentStatus: string
}

export default function ApprovalActions({
    projectId,
    milestoneId,
    currentStatus
}: ApprovalActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const [feedback, setFeedback] = useState('')

    if (currentStatus !== 'pending_approval') {
        return null
    }

    const handleApprove = async () => {
        if (!confirm('Approve this milestone? This will mark it as complete.')) return

        setLoading(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'approved',
                    approvedAt: new Date().toISOString(),
                }),
            })

            if (res.ok) {
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to approve:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleRequestRevision = async () => {
        if (!feedback.trim()) {
            alert('Please provide feedback for the revision request')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'in_progress',
                    feedback: feedback,
                }),
            })

            if (res.ok) {
                setShowFeedback(false)
                setFeedback('')
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to request revision:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Required</h3>
            <p className="text-gray-600 text-sm mb-4">
                Review the deliverables and approve or request revisions.
            </p>

            {showFeedback ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Revision Feedback *
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe what changes are needed..."
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRequestRevision}
                            disabled={loading || !feedback.trim()}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <MessageSquare className="w-4 h-4" />
                            )}
                            Send Feedback
                        </button>
                        <button
                            onClick={() => setShowFeedback(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                    </button>
                    <button
                        onClick={() => setShowFeedback(true)}
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 disabled:opacity-50"
                    >
                        <XCircle className="w-4 h-4" />
                        Request Revision
                    </button>
                </div>
            )}
        </div>
    )
}
