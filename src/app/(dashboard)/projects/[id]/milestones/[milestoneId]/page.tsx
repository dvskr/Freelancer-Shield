import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Edit,
    Calendar,
    DollarSign,
    CheckCircle,
    Clock,
    CircleDot,
    FileCheck,
    Upload
} from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import MilestoneStatusChanger from '@/components/milestones/MilestoneStatusChanger'
import DeliverableList from '@/components/deliverables/DeliverableList'
import SubmitForApprovalButton from '@/components/milestones/SubmitForApprovalButton'

interface MilestonePageProps {
    params: Promise<{ id: string; milestoneId: string }>
}

export async function generateMetadata({ params }: MilestonePageProps) {
    const { milestoneId } = await params
    const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
        select: { name: true },
    })
    return {
        title: milestone ? `${milestone.name} | FreelancerShield` : 'Milestone Not Found',
    }
}

export default async function MilestonePage({ params }: MilestonePageProps) {
    const { profile } = await requireAuth()
    const { id, milestoneId } = await params

    const project = await prisma.project.findUnique({
        where: { id, userId: profile.id },
    })

    if (!project) {
        notFound()
    }

    const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId, projectId: id },
        include: {
            deliverables: {
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!milestone) {
        notFound()
    }

    const getStatusInfo = () => {
        switch (milestone.status) {
            case 'approved':
                return { icon: <CheckCircle className="w-6 h-6 text-green-600" />, color: 'bg-green-100 border-green-200', text: 'Approved' }
            case 'paid':
                return { icon: <DollarSign className="w-6 h-6 text-emerald-600" />, color: 'bg-emerald-100 border-emerald-200', text: 'Paid' }
            case 'pending_approval':
                return { icon: <FileCheck className="w-6 h-6 text-yellow-600" />, color: 'bg-yellow-100 border-yellow-200', text: 'Pending Approval' }
            case 'in_progress':
                return { icon: <CircleDot className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100 border-blue-200', text: 'In Progress' }
            default:
                return { icon: <Clock className="w-6 h-6 text-gray-600" />, color: 'bg-gray-100 border-gray-200', text: 'Pending' }
        }
    }

    const status = getStatusInfo()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link
                        href={`/projects/${id}`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to {project.name}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{milestone.name}</h1>
                    <p className="text-gray-500 mt-1">
                        Milestone #{milestone.orderIndex + 1}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {milestone.status === 'in_progress' && milestone.deliverables.length > 0 && (
                        <SubmitForApprovalButton
                            projectId={id}
                            milestoneId={milestone.id}
                        />
                    )}
                    <Link
                        href={`/projects/${id}/milestones/${milestone.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Link>
                </div>
            </div>

            {/* Status Banner */}
            <div className={`rounded-xl border p-4 flex items-center gap-3 ${status.color}`}>
                {status.icon}
                <div>
                    <p className="font-medium text-gray-900">{status.text}</p>
                    {milestone.approvedAt && (
                        <p className="text-sm text-gray-600">
                            Approved on {formatDateTime(milestone.approvedAt)}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    {milestone.description && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{milestone.description}</p>
                        </div>
                    )}

                    {/* Deliverables */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Deliverables</h2>
                            <Link
                                href={`/projects/${id}/milestones/${milestone.id}/deliverables/new`}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                            >
                                <Upload className="w-4 h-4" />
                                Add Deliverable
                            </Link>
                        </div>
                        <DeliverableList
                            projectId={id}
                            milestoneId={milestone.id}
                            deliverables={milestone.deliverables}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="font-semibold text-gray-900">{formatCurrency(milestone.amount)}</p>
                                </div>
                            </div>
                            {milestone.dueDate && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Due Date</p>
                                        <p className="font-medium text-gray-900">{formatDate(milestone.dueDate)}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <FileCheck className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Deliverables</p>
                                    <p className="font-medium text-gray-900">{milestone.deliverables.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Changer */}
                    <MilestoneStatusChanger
                        projectId={id}
                        milestoneId={milestone.id}
                        currentStatus={milestone.status}
                    />
                </div>
            </div>
        </div>
    )
}
