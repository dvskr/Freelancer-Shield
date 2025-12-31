import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import {
    Users,
    FolderKanban,
    FileText,
    DollarSign,
    Plus,
    ArrowRight
} from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const metadata = {
    title: 'Dashboard | FreelancerShield',
}

export default async function DashboardPage() {
    const { profile } = await requireAuth()

    // Fetch dashboard stats
    const [clientCount, projectCount, invoiceStats] = await Promise.all([
        prisma.client.count({ where: { userId: profile.id } }),
        prisma.project.count({ where: { userId: profile.id, status: { not: 'cancelled' } } }),
        prisma.invoice.aggregate({
            where: { userId: profile.id },
            _sum: { total: true, amountPaid: true },
        }),
    ])

    const totalRevenue = invoiceStats._sum.amountPaid || 0
    const pendingAmount = (invoiceStats._sum.total || 0) - totalRevenue

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back{profile.firstName ? `, ${profile.firstName}` : ''}!
                </h1>
                <p className="text-gray-600 mt-1">
                    Here's what's happening with your freelance business.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Clients</p>
                            <p className="text-2xl font-bold text-gray-900">{clientCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FolderKanban className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Projects</p>
                            <p className="text-2xl font-bold text-gray-900">{projectCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <FileText className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Payment</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    href="/clients/new"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Add Client</p>
                        <p className="text-sm text-gray-500">Create a new client</p>
                    </div>
                </Link>

                <Link
                    href="/projects/new"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
                >
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Plus className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">New Project</p>
                        <p className="text-sm text-gray-500">Start a new project</p>
                    </div>
                </Link>

                <Link
                    href="/invoices/new"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                >
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Plus className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Create Invoice</p>
                        <p className="text-sm text-gray-500">Send an invoice</p>
                    </div>
                </Link>
            </div>

            {/* Getting Started */}
            {clientCount === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        🚀 Getting Started
                    </h3>
                    <p className="text-blue-700 mb-4">
                        Welcome to FreelancerShield! Here's how to get started:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-blue-700">
                        <li>Add your first client</li>
                        <li>Create a project with revision caps</li>
                        <li>Generate contracts and invoices</li>
                        <li>Set up automated payment reminders</li>
                    </ol>
                    <Link
                        href="/clients/new"
                        className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                        Add Your First Client
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    )
}
