import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Building2, Mail, Calendar, DollarSign, FileText, FileSignature } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate, formatCurrency } from '@/lib/utils'
import StatusChanger from '@/components/projects/StatusChanger'
import RevisionTracker from '@/components/projects/RevisionTracker'
import MilestoneList from '@/components/milestones/MilestoneList'

interface ProjectDetailPageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProjectDetailPageProps) {
    const { id } = await params
    const project = await prisma.project.findUnique({
        where: { id },
        select: { name: true },
    })
    return { title: project ? `${project.name} | FreelancerShield` : 'Project Not Found' }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
    const { profile } = await requireAuth()
    const { id } = await params

    const project = await prisma.project.findUnique({
        where: { id, userId: profile.id },
        include: {
            client: true,
            revisions: { orderBy: { createdAt: 'desc' } },
            invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
            contracts: { orderBy: { createdAt: 'desc' }, take: 5 },
            milestones: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    _count: { select: { deliverables: true } }
                }
            },
            _count: { select: { milestones: true, invoices: true, contracts: true } },
        },
    })

    if (!project) {
        notFound()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link href="/projects" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                        <StatusChanger projectId={project.id} currentStatus={project.status} />
                    </div>
                    <p className="text-gray-500 mt-1">Code: {project.code}</p>
                </div>
                <Link
                    href={`/projects/${project.id}/edit`}
                    className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                    <Edit className="w-4 h-4" />
                    Edit
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>

                        {project.description && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1">Description</p>
                                <p className="text-gray-700">{project.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Type</p>
                                <p className="font-medium text-gray-900 capitalize">{project.projectType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Value</p>
                                <p className="font-medium text-gray-900">{formatCurrency(project.totalAmount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Paid</p>
                                <p className="font-medium text-green-600">{formatCurrency(project.paidAmount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Outstanding</p>
                                <p className="font-medium text-gray-900">
                                    {formatCurrency(project.totalAmount - project.paidAmount)}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Start Date</p>
                                    <p className="text-gray-900">
                                        {project.startDate ? formatDate(project.startDate) : 'Not set'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">End Date</p>
                                    <p className="text-gray-900">
                                        {project.endDate ? formatDate(project.endDate) : 'Not set'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Milestones */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
                        </div>
                        <MilestoneList
                            projectId={project.id}
                            milestones={project.milestones}
                            totalAmount={project.totalAmount}
                        />
                    </div>

                    {/* Revision Tracker */}
                    <RevisionTracker
                        projectId={project.id}
                        revisionsCap={project.revisionsCap}
                        revisionsUsed={project.revisionsUsed}
                        extraRevisionFee={project.extraRevisionFee}
                        revisions={project.revisions}
                    />

                    {/* Recent Invoices */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
                            <Link
                                href={`/invoices?projectId=${project.id}`}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                View all
                            </Link>
                        </div>
                        {project.invoices.length === 0 ? (
                            <div className="text-center py-6">
                                <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">No invoices yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {project.invoices.map((invoice) => (
                                    <Link
                                        key={invoice.id}
                                        href={`/invoices/${invoice.id}`}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                                            <p className="text-sm text-gray-500">{formatDate(invoice.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">{formatCurrency(invoice.total)}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {invoice.status}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Client</h2>
                        <Link
                            href={`/clients/${project.client.id}`}
                            className="flex items-center gap-3 p-3 -m-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-lg">
                                    {project.client.name.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{project.client.name}</p>
                                {project.client.company && (
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {project.client.company}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {project.client.email}
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Milestones</span>
                                <span className="font-medium text-gray-900">{project._count.milestones}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Invoices</span>
                                <span className="font-medium text-gray-900">{project._count.invoices}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Contracts</span>
                                <span className="font-medium text-gray-900">{project._count.contracts}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Revisions Used</span>
                                <span className={`font-medium ${project.revisionsUsed >= project.revisionsCap ? 'text-red-600' : 'text-gray-900'}`}>
                                    {project.revisionsUsed} / {project.revisionsCap}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contracts */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Contracts</h2>
                            <Link
                                href={`/contracts/new?projectId=${project.id}`}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                Create
                            </Link>
                        </div>
                        {project.contracts.length === 0 ? (
                            <div className="text-center py-4">
                                <FileSignature className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">No contracts yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {project.contracts.map((contract) => (
                                    <Link
                                        key={contract.id}
                                        href={`/contracts/${contract.id}`}
                                        className="block p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <p className="font-medium text-gray-900 text-sm">{contract.name}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${contract.status === 'signed' ? 'bg-green-100 text-green-700' :
                                            contract.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {contract.status}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
