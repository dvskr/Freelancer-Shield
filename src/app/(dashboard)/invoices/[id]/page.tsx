import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Edit,
    Send,
    Download,
    Copy,
    MoreVertical,
    Printer,
    Mail
} from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate, formatCurrency } from '@/lib/utils'
import InvoiceItems from '@/components/invoices/InvoiceItems'
import InvoiceSummary from '@/components/invoices/InvoiceSummary'
import SendInvoiceButton from '@/components/invoices/SendInvoiceButton'
import RecordPaymentButton from '@/components/invoices/RecordPaymentButton'
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge'
import DownloadInvoiceButton from '@/components/invoices/DownloadInvoiceButton'

interface InvoicePageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: InvoicePageProps) {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        select: { invoiceNumber: true },
    })
    return {
        title: invoice ? `${invoice.invoiceNumber} | FreelancerShield` : 'Invoice Not Found',
    }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
    const { profile } = await requireAuth()
    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
        where: { id, userId: profile.id },
        include: {
            client: true,
            project: true,
            items: {
                include: {
                    milestone: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { createdAt: 'asc' },
            },
            payments: {
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!invoice) {
        notFound()
    }

    const user = await prisma.user.findUnique({
        where: { id: profile.id },
        select: {
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
        },
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link
                        href="/invoices"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Invoices
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
                        <InvoiceStatusBadge status={invoice.status} />
                    </div>
                    <p className="text-gray-500 mt-1">
                        Created {formatDate(invoice.createdAt)}
                        {invoice.sentAt && ` • Sent ${formatDate(invoice.sentAt)}`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {invoice.status === 'draft' && (
                        <>
                            {/* Edit functionality to be implemented in future/if needed, not in spec explicitly but referenced */}
                            {/* <Link
                href={`/invoices/${invoice.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link> */}
                            <SendInvoiceButton
                                invoiceId={invoice.id}
                                clientEmail={invoice.client.email}
                            />
                        </>
                    )}
                    {['sent', 'viewed', 'overdue'].includes(invoice.status) && (
                        <RecordPaymentButton
                            invoiceId={invoice.id}
                            balance={invoice.total - invoice.amountPaid}
                        />
                    )}
                    <DownloadInvoiceButton invoiceId={invoice.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* From/To */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">From</p>
                                <p className="font-semibold text-gray-900">
                                    {user?.businessName || `${user?.firstName} ${user?.lastName}`}
                                </p>
                                {user?.address && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {user.address}<br />
                                        {user.city}, {user.state} {user.zipCode}
                                    </p>
                                )}
                                {user?.email && (
                                    <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Bill To</p>
                                <Link
                                    href={`/clients/${invoice.client.id}`}
                                    className="font-semibold text-gray-900 hover:text-blue-600"
                                >
                                    {invoice.client.name}
                                </Link>
                                {invoice.client.company && (
                                    <p className="text-sm text-gray-600">{invoice.client.company}</p>
                                )}
                                {invoice.client.address && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {invoice.client.address}<br />
                                        {invoice.client.city}, {invoice.client.state} {invoice.client.zipCode}
                                    </p>
                                )}
                                <p className="text-sm text-gray-600 mt-1">{invoice.client.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Project Link */}
                    {invoice.project && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-700">
                                Project: <Link href={`/projects/${invoice.project.id}`} className="font-medium hover:underline">{invoice.project.name}</Link>
                            </p>
                        </div>
                    )}

                    {/* Line Items */}
                    <InvoiceItems
                        items={invoice.items.map(item => ({
                            id: item.id,
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.total,
                            milestone: item.milestone,
                        }))}
                        subtotal={invoice.subtotal}
                        taxRate={invoice.taxRate}
                        taxAmount={invoice.taxAmount}
                        discountAmount={invoice.discountAmount}
                        total={invoice.total}
                    />

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Payment History */}
                    {invoice.payments.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                            <div className="space-y-3">
                                {invoice.payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                                            <p className="text-sm text-gray-500">
                                                {payment.method && `${payment.method} • `}
                                                {formatDate(payment.createdAt)}
                                            </p>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                            Received
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <InvoiceSummary
                        invoiceNumber={invoice.invoiceNumber}
                        status={invoice.status}
                        total={invoice.total}
                        amountPaid={invoice.amountPaid}
                        dueDate={invoice.dueDate}
                        issueDate={invoice.issueDate}
                    />

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                <Printer className="w-5 h-5 text-gray-400" />
                                Print Invoice
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                <Copy className="w-5 h-5 text-gray-400" />
                                Duplicate Invoice
                            </button>
                            {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 rounded-lg">
                                    <Mail className="w-5 h-5" />
                                    Send Reminder
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
