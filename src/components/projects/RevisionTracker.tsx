"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, Plus, AlertTriangle, X, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Revision {
    id: string
    revisionNumber: number
    description: string
    status: string
    isExtra: boolean
    amount: number
    createdAt: Date
}

interface RevisionTrackerProps {
    projectId: string
    revisionsCap: number
    revisionsUsed: number
    extraRevisionFee: number
    revisions: Revision[]
}

export default function RevisionTracker({
    projectId,
    revisionsCap,
    revisionsUsed,
    extraRevisionFee,
    revisions
}: RevisionTrackerProps) {
    const router = useRouter()
    const [showAddForm, setShowAddForm] = useState(false)
    const [newRevision, setNewRevision] = useState('')
    const [loading, setLoading] = useState(false)

    const remainingRevisions = Math.max(0, revisionsCap - revisionsUsed)
    const isOverCap = revisionsUsed >= revisionsCap

    const handleAddRevision = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newRevision.trim()) return

        setLoading(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/revisions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: newRevision }),
            })
            if (res.ok) {
                setNewRevision('')
                setShowAddForm(false)
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to add revision:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Revision Tracker</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Log Revision
                </button>
            </div>

            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{revisionsUsed} of {revisionsCap} revisions used</span>
                    <span className={isOverCap ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {remainingRevisions} remaining
                    </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${isOverCap ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(100, (revisionsUsed / revisionsCap) * 100)}%` }}
                    />
                </div>
            </div>

            {isOverCap && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-yellow-800">Revision Cap Reached</p>
                        <p className="text-sm text-yellow-700">
                            Additional revisions will be charged at {formatCurrency(extraRevisionFee)} each.
                        </p>
                    </div>
                </div>
            )}

            {showAddForm && (
                <form onSubmit={handleAddRevision} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">New Revision Request</label>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <textarea
                        value={newRevision}
                        onChange={(e) => setNewRevision(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
                        placeholder="Describe the revision request..."
                    />
                    {isOverCap && (
                        <p className="text-sm text-yellow-600 mt-2">
                            ⚠️ This revision will be charged at {formatCurrency(extraRevisionFee)}
                        </p>
                    )}
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !newRevision.trim()}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Adding...
                                </>
                            ) : 'Add Revision'}
                        </button>
                    </div>
                </form>
            )}

            {revisions.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                    <RotateCcw className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No revisions logged yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {revisions.map((revision) => (
                        <div
                            key={revision.id}
                            className={`p-3 rounded-lg border ${revision.isExtra ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">Revision #{revision.revisionNumber}</span>
                                {revision.isExtra && (
                                    <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full">
                                        Extra • {formatCurrency(revision.amount)}
                                    </span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${revision.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {revision.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700">{revision.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Requested {formatDate(revision.createdAt)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
