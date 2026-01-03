import { requirePortalAuth } from '@/lib/portal/protect'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import {
    FileText,
    FolderKanban,
    CheckSquare,
    DollarSign,
    AlertCircle,
    ArrowRight
} from 'lucide-react'

export const metadata = {
    title: 'Dashboard | Client Portal',
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100)
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date))
}

export default async function PortalDashboardPage() {
    const { client, freelancer } = await requirePortalAuth()

    // Fetch client data
    const [invoices, projects, pendingApprovals] = await Promise.all([
        prisma.invoice.findMany({
            where: { clientId: client.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
        }),
        prisma.project.findMany({
            where: { clientId: client.id },
            include: {
                _count: { select: { milestones: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 5,
        }),
        prisma.milestone.findMany({
            where: {
                project: { clientId: client.id },
                status: 'pending_approval',
            },
            include: {
                project: { select: { name: true } },
            },
            orderBy: { updatedAt: 'desc' },
        }),
    ])

    // Calculate stats
    const stats = {
        totalInvoices: invoices.length,
        unpaidAmount: invoices
            .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
            .reduce((sum, i) => sum + (i.total - i.amountPaid), 0),
        activeProjects: projects.filter(p => p.status === 'active').length,
        pendingApprovals: pendingApprovals.length,
    }

    const freelancerName = freelancer.businessName ||
        `${freelancer.firstName} ${freelancer.lastName}`

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {client.name}
                </h1>
                <p className="text-gray-600 mt-1">
                    Here's an overview of your account with {freelancerName}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-sm text-gray-500">Outstanding</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats.unpaidAmount)}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-500">Invoices</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.totalInvoices}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <FolderKanban className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-500">Active Projects</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.activeProjects}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <CheckSquare className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-500">Pending Approval</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.pendingApprovals}
                    </p>
                </div>
            </div>

            {/* Pending Approvals Alert */}
            {pendingApprovals.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-purple-900">
                                {pendingApprovals.length} milestone{pendingApprovals.length > 1 ? 's' : ''} awaiting your approval
                            </h3>
                            <p className="text-sm text-purple-700 mt-1">
                                Review and approve milestones to keep projects moving.
                            </p>
                        </div>
                        <Link
                            href="/portal/approvals"
                            className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
                        >
                            Review <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Invoices */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
                        <Link href="/portal/invoices" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View All
                        </Link>
                    </div>
                    {invoices.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No invoices yet
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {invoices.slice(0, 3).map((invoice) => (
                                <Link
                                    key={invoice.id}
                                    href={`/portal/invoices/${invoice.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                                        <p className="text-sm text-gray-500">{formatDate(invoice.dueDate)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">{formatCurrency(invoice.total)}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${invoice.status === 'paid'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Projects */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Projects</h2>
                        <Link href="/portal/projects" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View All
                        </Link>
                    </div>
                    {projects.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No projects yet
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {projects.slice(0, 3).map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/portal/projects/${project.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{project.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {project._count.milestones} milestones
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${project.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : project.status === 'completed'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {project.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
