import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { Plus, FileSignature, Send, CheckCircle } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import ContractFilters from '@/components/contracts/ContractFilters'

export const metadata = {
    title: 'Contracts | FreelancerShield',
}

interface ContractsPageProps {
    searchParams: Promise<{ status?: string; clientId?: string }>
}

export default async function ContractsPage({ searchParams }: ContractsPageProps) {
    const { profile } = await requireAuth()
    const params = await searchParams
    const statusFilter = params.status || ''
    const clientIdFilter = params.clientId || ''

    const contracts = await prisma.contract.findMany({
        where: {
            userId: profile.id,
            ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
            ...(clientIdFilter && { clientId: clientIdFilter }),
        },
        include: {
            client: { select: { id: true, name: true, company: true } },
            project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    const clients = await prisma.client.findMany({
        where: { userId: profile.id },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

    const stats = {
        total: contracts.length,
        draft: contracts.filter(c => c.status === 'draft').length,
        sent: contracts.filter(c => c.status === 'sent').length,
        signed: contracts.filter(c => c.status === 'signed').length,
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'signed': return 'bg-green-100 text-green-700'
            case 'sent': return 'bg-blue-100 text-blue-700'
            case 'viewed': return 'bg-purple-100 text-purple-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'signed': return <CheckCircle className="w-4 h-4" />
            case 'sent': return <Send className="w-4 h-4" />
            default: return <FileSignature className="w-4 h-4" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
                    <p className="text-gray-600 mt-1">Manage your contracts and track signatures</p>
                </div>
                <Link
                    href="/contracts/new"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Contract
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Contracts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Draft</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Sent</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Signed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
                </div>
            </div>

            {/* Filters */}
            <ContractFilters
                clients={clients}
                initialFilters={{
                    status: statusFilter || 'all',
                    clientId: clientIdFilter || '',
                }}
            />

            {contracts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <FileSignature className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No contracts yet</h3>
                    <p className="text-gray-500 mb-6">Create your first contract from a template.</p>
                    <Link href="/contracts/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        <Plus className="w-5 h-5" />
                        Create Your First Contract
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contract</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Project</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {contracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <Link href={`/contracts/${contract.id}`}>
                                            <p className="font-medium text-gray-900 hover:text-blue-600">{contract.name}</p>
                                            <p className="text-sm text-gray-500">{contract.code}</p>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/clients/${contract.client.id}`} className="text-gray-700 hover:text-blue-600">
                                            {contract.client.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        {contract.project ? (
                                            <Link href={`/projects/${contract.project.id}`} className="text-gray-700 hover:text-blue-600">
                                                {contract.project.name}
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                                            {getStatusIcon(contract.status)}
                                            {contract.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(contract.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
