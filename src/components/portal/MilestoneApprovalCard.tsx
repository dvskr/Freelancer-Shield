"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    CheckCircle,
    XCircle,
    FileText,
    Download,
    Loader2,
    MessageSquare,
    ChevronDown,
    ChevronUp
} from 'lucide-react'

interface Deliverable {
    id: string
    name: string
    description: string | null
    fileUrl: string | null
    fileType: string | null
    status: string
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100)
}

interface MilestoneApprovalCardProps {
    milestone: {
        id: string
        name: string
        description: string | null
        amount: number
        project: { id: string; name: string }
        deliverables: Deliverable[]
    }
}

export default function MilestoneApprovalCard({ milestone }: MilestoneApprovalCardProps) {
    const router = useRouter()
    const [expanded, setExpanded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const [feedback, setFeedback] = useState('')

    const handleApprove = async () => {
        if (!confirm('Approve this milestone? This will mark it as complete.')) return

        setLoading(true)
        try {
            const res = await fetch(`/api/portal/milestones/${milestone.id}/approve`, {
                method: 'POST',
            })

            if (!res.ok) throw new Error('Failed to approve')

            router.refresh()
        } catch (err) {
            alert('Failed to approve milestone. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleRequestRevision = async () => {
        if (!feedback.trim()) {
            alert('Please provide feedback for the revision request.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/portal/milestones/${milestone.id}/revision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback }),
            })

            if (!res.ok) throw new Error('Failed to request revision')

            router.refresh()
        } catch (err) {
            alert('Failed to request revision. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-purple-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-purple-50 border-b border-purple-200">
                <div className="flex items-start justify-between">
                    <div>
                        <Link
                            href={`/portal/projects/${milestone.project.id}`}
                            className="text-sm text-purple-600 hover:text-purple-700"
                        >
                            {milestone.project.name}
                        </Link>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">{milestone.name}</h3>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(milestone.amount)}
                    </span>
                </div>
            </div>

            {/* Description */}
            {milestone.description && (
                <div className="p-4 border-b border-gray-100">
                    <p className="text-gray-600">{milestone.description}</p>
                </div>
            )}

            {/* Deliverables */}
            {milestone.deliverables.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3"
                    >
                        <FileText className="w-4 h-4" />
                        {milestone.deliverables.length} Deliverable{milestone.deliverables.length > 1 ? 's' : ''}
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {expanded && (
                        <div className="space-y-2 pl-6">
                            {milestone.deliverables.map((deliverable) => (
                                <div key={deliverable.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{deliverable.name}</p>
                                        {deliverable.description && (
                                            <p className="text-sm text-gray-500">{deliverable.description}</p>
                                        )}
                                    </div>
                                    {deliverable.fileUrl && (
                                        <a
                                            href={deliverable.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Feedback Form */}
            {showFeedback && (
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        What needs to be changed?
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                        placeholder="Please describe what revisions are needed..."
                    />
                </div>
            )}

            {/* Actions */}
            <div className="p-4 flex items-center gap-3">
                {showFeedback ? (
                    <>
                        <button
                            onClick={() => setShowFeedback(false)}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRequestRevision}
                            disabled={loading || !feedback.trim()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <MessageSquare className="w-4 h-4" />
                                    Send Revision Request
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setShowFeedback(true)}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50"
                        >
                            <XCircle className="w-4 h-4" />
                            Request Revision
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Approve Milestone
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
