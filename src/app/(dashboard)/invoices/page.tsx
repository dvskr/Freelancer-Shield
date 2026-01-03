import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import {
    Plus,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    Eye,
    Send,
    Ban,
    DollarSign,
    Filter
} from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate, formatCurrency } from '@/lib/utils'
import Filters from '@/components/invoices/Filters'

export const metadata = {
    title: 'Invoices | FreelancerShield',
}

interface InvoicesPageProps {
    searchParams: Promise<{
        status?: string
        clientId?: string
        q?: string
    }>
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
    const { profile } = await requireAuth()
    const { status, clientId, q: searchQuery } = await searchParams

    const invoices = await prisma.invoice.findMany({
        where: {
            userId: profile.id,
            ...(status && status !== 'all' && { status }),
            ...(clientId && { clientId }),
            ...(searchQuery && {
                OR: [
                    { invoiceNumber: { contains: searchQuery, mode: 'insensitive' } },
                    { client: { name: { contains: searchQuery, mode: 'insensitive' } } },
                ],
            }),
        },
        include: {
            client: {
                select: { id: true, name: true, company: true },
            },
            project: {
                select: { id: true, name: true },
            },
            _count: {
                select: { items: true, payments: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    // Calculate stats logic needs to be robust against empty arrays
    // but Prisma returns empty array [] if no results

    // Need to fetch ALL invoices for stats to be accurate regardless of filters? 
    // The requirements say "Stats" overview. Usually stats should be global or filtered. 
    // Let's keep it based on CURRENT filtered view as implemented in the prompt snippet, 
    // BUT the prompt snippet used `invoices` for stats. 
    // If the user filters by "Draft", the stats cards for "Paid" would be 0. 
    // However, looking at the code, it uses `invoices` (the result of the query). 
    // So stats reflect the filtered result. That is acceptable basic behavior.
    // Actually, standard dashboards often show GLOBAL stats at top. 
    // Let's stick to the prompt's implementation which uses the queried invoices.

    const clients = await prisma.client.findMany({
        where: { userId: profile.id },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

    const stats = {
        total: invoices.length,
        draft: invoices.filter(i => i.status === 'draft').length,
        sent: invoices.filter(i => i.status === 'sent' || i.status === 'viewed').length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        paid: invoices.filter(i => i.status === 'paid').length,
        totalOutstanding: invoices
            .filter(i => ['sent', 'viewed', 'overdue'].includes(i.status))
            .reduce((sum, i) => sum + (i.total - i.amountPaid), 0),
        totalPaid: invoices
            .filter(i => i.status === 'paid')
            .reduce((sum, i) => sum + i.total, 0),
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />
            case 'viewed': return <Eye className="w-4 h-4 text-purple-600" />
            case 'sent': return <Send className="w-4 h-4 text-blue-600" />
            case 'cancelled': return <Ban className="w-4 h-4 text-gray-400" />
            default: return <Clock className="w-4 h-4 text-gray-400" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700'
            case 'overdue': return 'bg-red-100 text-red-700'
            case 'viewed': return 'bg-purple-100 text-purple-700'
            case 'sent': return 'bg-blue-100 text-blue-700'
            case 'cancelled': return 'bg-gray-100 text-gray-500'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const isOverdue = (invoice: typeof invoices[0]) => {
        if (invoice.status === 'paid' || invoice.status === 'cancelled') return false
        return new Date(invoice.dueDate) < new Date()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-600 mt-1">Create and manage client invoices</p>
                </div>
                <Link
                    href="/invoices/new"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Invoice
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Outstanding</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalOutstanding)}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.sent} invoices</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                    <p className="text-xs text-gray-500 mt-1">Need attention</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.paid} invoices</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Draft</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                    <p className="text-xs text-gray-500 mt-1">Not sent yet</p>
                </div>
            </div>

            {/* Filters */}
            <Filters
                clients={clients}
                initialFilters={{
                    status: status || 'all',
                    clientId: clientId || '',
                    q: searchQuery || '',
                }}
            />

            {/* Invoice List */}
            {invoices.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchQuery || status ? 'No invoices found' : 'No invoices yet'}
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {searchQuery || status
                            ? 'Try adjusting your filters.'
                            : 'Create your first invoice to start getting paid.'}
                    </p>
                    {!searchQuery && !status && (
                        <Link
                            href="/invoices/new"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Invoice
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Link href={`/invoices/${invoice.id}`} className="block">
                                                <p className="font-medium text-gray-900 hover:text-blue-600">
                                                    {invoice.invoiceNumber}
                                                </p>
                                                {invoice.project && (
                                                    <p className="text-sm text-gray-500">{invoice.project.name}</p>
                                                )}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/clients/${invoice.client.id}`} className="text-gray-700 hover:text-blue-600">
                                                {invoice.client.name}
                                                {invoice.client.company && (
                                                    <span className="text-gray-500 text-sm block">{invoice.client.company}</span>
                                                )}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                                {getStatusIcon(invoice.status)}
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{formatCurrency(invoice.total)}</p>
                                            {invoice.amountPaid > 0 && invoice.amountPaid < invoice.total && (
                                                <p className="text-sm text-green-600">
                                                    {formatCurrency(invoice.amountPaid)} paid
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={isOverdue(invoice) ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                                {formatDate(invoice.dueDate)}
                                                {isOverdue(invoice) && <span className="block text-xs">Overdue</span>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(invoice.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
