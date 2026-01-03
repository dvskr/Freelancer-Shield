import { requirePortalAuth } from '@/lib/portal/protect'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Download, CheckCircle } from 'lucide-react'
import PortalPaymentButton from '@/components/portal/PortalPaymentButton'

interface PortalInvoicePageProps {
    params: Promise<{ id: string }>
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

export async function generateMetadata({ params }: PortalInvoicePageProps) {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        select: { invoiceNumber: true },
    })
    return {
        title: invoice ? `${invoice.invoiceNumber} | Client Portal` : 'Invoice Not Found',
    }
}

export default async function PortalInvoicePage({ params }: PortalInvoicePageProps) {
    const { id } = await params
    const { client, freelancer } = await requirePortalAuth()

    const invoice = await prisma.invoice.findUnique({
        where: { id, clientId: client.id },
        include: {
            items: true,
            project: { select: { name: true } },
            payments: { orderBy: { createdAt: 'desc' } },
        },
    })

    if (!invoice) {
        notFound()
    }

    const balance = invoice.total - invoice.amountPaid
    const canPay = invoice.status !== 'paid' && invoice.status !== 'cancelled' && balance > 0
    const freelancerName = freelancer.businessName || `${freelancer.firstName} ${freelancer.lastName}`

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/portal/invoices"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Invoices
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
                </div>
                {invoice.status === 'paid' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Paid</span>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Invoice Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-sm text-gray-500">From</p>
                                <p className="font-semibold text-gray-900">{freelancerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">To</p>
                                <p className="font-semibold text-gray-900">{client.name}</p>
                                {client.company && <p className="text-gray-600">{client.company}</p>}
                            </div>
                        </div>

                        {invoice.project && (
                            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    Project: <strong>{invoice.project.name}</strong>
                                </p>
                            </div>
                        )}

                        {/* Line Items */}
                        <table className="w-full mb-6">
                            <thead className="border-b border-gray-200">
                                <tr className="text-sm text-gray-500">
                                    <th className="text-left pb-2">Description</th>
                                    <th className="text-center pb-2">Qty</th>
                                    <th className="text-right pb-2">Unit Price</th>
                                    <th className="text-right pb-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-100">
                                        <td className="py-3 text-gray-900">{item.description}</td>
                                        <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                                        <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                                        <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                {invoice.taxAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax ({invoice.taxRate}%)</span>
                                        <span className="text-gray-900">{formatCurrency(invoice.taxAmount)}</span>
                                    </div>
                                )}
                                {invoice.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Discount</span>
                                        <span className="text-red-600">-{formatCurrency(invoice.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-gray-900">{formatCurrency(invoice.total)}</span>
                                </div>
                                {invoice.amountPaid > 0 && invoice.status !== 'paid' && (
                                    <>
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Paid</span>
                                            <span>-{formatCurrency(invoice.amountPaid)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-orange-600">
                                            <span>Balance Due</span>
                                            <span>{formatCurrency(balance)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Payment History */}
                    {invoice.payments.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Payment History</h3>
                            <div className="space-y-3">
                                {invoice.payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                                            <p className="text-sm text-gray-500">{formatDate(payment.createdAt)}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                            Paid
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Payment Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-500">
                                {canPay ? 'Amount Due' : 'Total Amount'}
                            </p>
                            <p className={`text-3xl font-bold ${canPay ? 'text-orange-600' : 'text-gray-900'}`}>
                                {formatCurrency(canPay ? balance : invoice.total)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Due {formatDate(invoice.dueDate)}
                            </p>
                        </div>

                        {canPay && (
                            <PortalPaymentButton
                                invoiceId={invoice.id}
                                amount={balance}
                                paymentLinkUrl={invoice.stripePaymentLinkUrl}
                            />
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <Link
                                href={`/api/invoices/${invoice.id}/pdf`}
                                className="flex items-center justify-center gap-2 w-full py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </Link>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                        <p className="font-medium text-gray-900 mb-2">Need help?</p>
                        <p>Contact {freelancerName} at {freelancer.email}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
