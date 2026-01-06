import { requirePortalAuth } from '@/lib/portal/protect'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText
} from 'lucide-react'

interface PortalProjectPageProps {
    params: Promise<{ id: string }>
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100)
}

export async function generateMetadata({ params }: PortalProjectPageProps) {
    const { id } = await params
    const project = await prisma.project.findUnique({
        where: { id },
        select: { name: true },
    })
    return {
        title: project ? `${project.name} | Client Portal` : 'Project Not Found',
    }
}

export default async function PortalProjectPage({ params }: PortalProjectPageProps) {
    const { id } = await params
    const { client } = await requirePortalAuth()

    const project = await prisma.project.findUnique({
        where: { id, clientId: client.id },
        include: {
            milestones: {
                include: {
                    deliverables: true,
                },
                orderBy: { orderIndex: 'asc' },
            },
            contracts: {
                select: { id: true, name: true },
                take: 1,
            },
        },
    })

    if (!project) {
        notFound()
    }

    const totalMilestones = project.milestones.length
    const completedMilestones = project.milestones.filter(
        m => m.status === 'approved' || m.status === 'paid'
    ).length
    const progress = totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0

    const totalBudget = project.milestones.reduce((sum, m) => sum + m.amount, 0)
    const completedBudget = project.milestones
        .filter(m => m.status === 'approved' || m.status === 'paid')
        .reduce((sum, m) => sum + m.amount, 0)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
            case 'paid':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'pending_approval':
                return <AlertCircle className="w-5 h-5 text-purple-600" />
            case 'in_progress':
                return <Clock className="w-5 h-5 text-blue-600" />
            default:
                return <Clock className="w-5 h-5 text-gray-400" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
            case 'paid':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'pending_approval':
                return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'in_progress':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/portal/projects"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                        {project.description && (
                            <p className="text-gray-600 mt-1">{project.description}</p>
                        )}
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-700' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {project.status}
                    </span>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-500 mb-1">Overall Progress</p>
                    <p className="text-3xl font-bold text-gray-900">{progress}%</p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
                        <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-500 mb-1">Milestones</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {completedMilestones}/{totalMilestones}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">completed</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-500 mb-1">Budget</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(completedBudget)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        of {formatCurrency(totalBudget)} completed
                    </p>
                </div>
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Milestones</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {project.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{milestone.name}</h3>
                                            {milestone.description && (
                                                <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-gray-900">
                                                {formatCurrency(milestone.amount)}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(milestone.status)}`}>
                                                {getStatusIcon(milestone.status)}
                                                {milestone.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Deliverables */}
                                    {milestone.deliverables.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {milestone.deliverables.map((deliverable) => (
                                                <span
                                                    key={deliverable.id}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                                                >
                                                    <FileText className="w-3 h-3" />
                                                    {deliverable.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Pending Approval CTA */}
                                    {milestone.status === 'pending_approval' && (
                                        <div className="mt-3">
                                            <Link
                                                href={`/portal/approvals?milestone=${milestone.id}`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                                            >
                                                Review & Approve
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contract Link */}
            {project.contracts[0] && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-sm text-blue-700">
                                This project is covered by contract: <strong>{project.contracts[0].name}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
