"use client"

import { useState } from 'react'
import Link from 'next/link'
import {
    CheckCircle,
    Clock,
    CircleDot,
    DollarSign,
    Calendar,
    Plus,
    GripVertical,
    MoreVertical,
    Edit,
    Trash2,
    FileCheck,
    Loader2
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Milestone {
    id: string
    name: string
    description: string | null
    amount: number
    status: string
    dueDate: Date | null
    orderIndex: number
    approvedAt: Date | null
    _count: {
        deliverables: number
    }
}

interface MilestoneListProps {
    projectId: string
    milestones: Milestone[]
    totalAmount: number
}

export default function MilestoneList({ projectId, milestones, totalAmount }: MilestoneListProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
            case 'paid':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'pending_approval':
                return <FileCheck className="w-5 h-5 text-yellow-600" />
            case 'in_progress':
                return <CircleDot className="w-5 h-5 text-blue-600" />
            default:
                return <Clock className="w-5 h-5 text-gray-400" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700'
            case 'paid': return 'bg-emerald-100 text-emerald-700'
            case 'pending_approval': return 'bg-yellow-100 text-yellow-700'
            case 'in_progress': return 'bg-blue-100 text-blue-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const handleDelete = async (milestoneId: string) => {
        if (!confirm('Delete this milestone? This will also delete all deliverables.')) return

        setDeleting(milestoneId)
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                window.location.reload()
            }
        } catch (err) {
            console.error('Failed to delete milestone:', err)
        } finally {
            setDeleting(null)
        }
    }

    // Calculate progress
    const completedAmount = milestones
        .filter(m => m.status === 'approved' || m.status === 'paid')
        .reduce((sum, m) => sum + m.amount, 0)
    const progressPercent = totalAmount > 0 ? Math.round((completedAmount / totalAmount) * 100) : 0

    return (
        <div className="space-y-4">
            {/* Progress Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Milestone Progress</span>
                    <span className="text-sm text-gray-500">
                        {formatCurrency(completedAmount)} of {formatCurrency(totalAmount)}
                    </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{milestones.filter(m => m.status === 'approved' || m.status === 'paid').length} of {milestones.length} completed</span>
                    <span>{progressPercent}%</span>
                </div>
            </div>

            {/* Milestone List */}
            {milestones.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No milestones yet</h3>
                    <p className="text-gray-500 text-sm mb-4">Break your project into milestones to track progress and payments.</p>
                    <Link
                        href={`/projects/${projectId}/milestones/new`}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add First Milestone
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {milestones.map((milestone, index) => (
                        <div
                            key={milestone.id}
                            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                {/* Drag Handle & Status */}
                                <div className="flex items-center gap-2">
                                    <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />
                                    {getStatusIcon(milestone.status)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <Link
                                                href={`/projects/${projectId}/milestones/${milestone.id}`}
                                                className="font-medium text-gray-900 hover:text-blue-600"
                                            >
                                                {milestone.name}
                                            </Link>
                                            {milestone.description && (
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                    {milestone.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(milestone.status)}`}>
                                                    {milestone.status.replace('_', ' ')}
                                                </span>
                                                {milestone.dueDate && (
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Due {formatDate(milestone.dueDate)}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <FileCheck className="w-3 h-3" />
                                                    {milestone._count.deliverables} deliverable{milestone._count.deliverables !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{formatCurrency(milestone.amount)}</p>
                                                <p className="text-xs text-gray-500">#{index + 1}</p>
                                            </div>

                                            {/* Actions Menu */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenu(activeMenu === milestone.id ? null : milestone.id)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-400" />
                                                </button>

                                                {activeMenu === milestone.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setActiveMenu(null)}
                                                        />
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                                            <Link
                                                                href={`/projects/${projectId}/milestones/${milestone.id}`}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                            >
                                                                <FileCheck className="w-4 h-4" />
                                                                View Details
                                                            </Link>
                                                            <Link
                                                                href={`/projects/${projectId}/milestones/${milestone.id}/edit`}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(milestone.id)}
                                                                disabled={deleting === milestone.id}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                                            >
                                                                {deleting === milestone.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="w-4 h-4" />
                                                                )}
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add More Button */}
                    <Link
                        href={`/projects/${projectId}/milestones/new`}
                        className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Another Milestone
                    </Link>
                </div>
            )}
        </div>
    )
}
