import { requirePortalAuth } from '@/lib/portal/protect'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

export const metadata = {
    title: 'Invoices | Client Portal',
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

export default async function PortalInvoicesPage() {
    const { client } = await requirePortalAuth()

    const invoices = await prisma.invoice.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: 'desc' },
    })

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'overdue':
                return <AlertTriangle className="w-4 h-4 text-red-600" />
            default:
                return <Clock className="w-4 h-4 text-orange-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-700'
            case 'overdue':
                return 'bg-red-100 text-red-700'
            case 'cancelled':
                return 'bg-gray-100 text-gray-500'
            default:
                return 'bg-orange-100 text-orange-700'
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                <p className="text-gray-600 mt-1">View and pay your invoices</p>
            </div>

            {invoices.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h3>
                    <p className="text-gray-500">Your invoices will appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.map((invoice) => {
                                const balance = invoice.total - invoice.amountPaid
                                const canPay = invoice.status !== 'paid' && invoice.status !== 'cancelled' && balance > 0

                                return (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Link href={`/portal/invoices/${invoice.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                                                {invoice.invoiceNumber}
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
                                            {invoice.amountPaid > 0 && invoice.status !== 'paid' && (
                                                <p className="text-xs text-gray-500">
                                                    {formatCurrency(balance)} remaining
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {formatDate(invoice.dueDate)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {canPay ? (
                                                <Link
                                                    href={`/portal/invoices/${invoice.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                                >
                                                    Pay Now
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/portal/invoices/${invoice.id}`}
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    View
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
