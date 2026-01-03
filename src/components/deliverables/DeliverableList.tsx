"use client"

import { useState } from 'react'
import Link from 'next/link'
import {
    FileText,
    Image,
    File,
    Download,
    Trash2,
    ExternalLink,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2,
    MessageSquare
} from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'

interface Deliverable {
    id: string
    name: string
    description: string | null
    fileUrl: string | null
    fileType: string | null
    fileSize: number | null
    status: string
    feedback: string | null
    createdAt: Date
}

interface DeliverableListProps {
    projectId: string
    milestoneId: string
    deliverables: Deliverable[]
}

export default function DeliverableList({
    projectId,
    milestoneId,
    deliverables
}: DeliverableListProps) {
    const [deleting, setDeleting] = useState<string | null>(null)

    const getFileIcon = (fileType: string | null) => {
        if (!fileType) return <File className="w-8 h-8 text-gray-400" />
        if (fileType.startsWith('image/')) return <Image className="w-8 h-8 text-purple-500" />
        if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
        return <File className="w-8 h-8 text-blue-500" />
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                    </span>
                )
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                        <AlertCircle className="w-3 h-3" />
                        Needs Revision
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                        <Clock className="w-3 h-3" />
                        Pending Review
                    </span>
                )
        }
    }

    const handleDelete = async (deliverableId: string) => {
        if (!confirm('Delete this deliverable?')) return

        setDeleting(deliverableId)
        try {
            const res = await fetch(
                `/api/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}`,
                { method: 'DELETE' }
            )
            if (res.ok) {
                window.location.reload()
            }
        } catch (err) {
            console.error('Failed to delete deliverable:', err)
        } finally {
            setDeleting(null)
        }
    }

    if (deliverables.length === 0) {
        return (
            <div className="text-center py-8">
                <File className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No deliverables added yet</p>
                <Link
                    href={`/projects/${projectId}/milestones/${milestoneId}/deliverables/new`}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                >
                    Add your first deliverable
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {deliverables.map((deliverable) => (
                <div
                    key={deliverable.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                        {getFileIcon(deliverable.fileType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="font-medium text-gray-900">{deliverable.name}</h4>
                                {deliverable.description && (
                                    <p className="text-sm text-gray-500 mt-1">{deliverable.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                    {getStatusBadge(deliverable.status)}
                                    {deliverable.fileSize && (
                                        <span className="text-xs text-gray-500">
                                            {formatFileSize(deliverable.fileSize)}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500">
                                        Added {formatDate(deliverable.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {deliverable.fileUrl && (
                                    <a
                                        href={deliverable.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white"
                                        title="View/Download"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                                <button
                                    onClick={() => handleDelete(deliverable.id)}
                                    disabled={deleting === deliverable.id}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white"
                                    title="Delete"
                                >
                                    {deleting === deliverable.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Feedback */}
                        {deliverable.feedback && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <MessageSquare className="w-4 h-4" />
                                    Client Feedback
                                </div>
                                <p className="text-sm text-gray-700">{deliverable.feedback}</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
