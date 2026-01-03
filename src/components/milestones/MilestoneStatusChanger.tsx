"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

interface MilestoneStatusChangerProps {
    projectId: string
    milestoneId: string
    currentStatus: string
}

const statuses = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'pending_approval', label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'paid', label: 'Paid', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
]

export default function MilestoneStatusChanger({
    projectId,
    milestoneId,
    currentStatus
}: MilestoneStatusChangerProps) {
    const router = useRouter()
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === status) return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!res.ok) {
                throw new Error('Failed to update status')
            }

            setStatus(newStatus)
            router.refresh()
        } catch (err) {
            setError('Failed to update status')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div className="space-y-2">
                {statuses.map((s) => (
                    <button
                        key={s.value}
                        onClick={() => handleStatusChange(s.value)}
                        disabled={loading}
                        className={`w-full px-4 py-2.5 rounded-lg border-2 font-medium text-left transition-all ${status === s.value
                                ? `${s.color} border-current`
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading && status !== s.value && (
                            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        )}
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
