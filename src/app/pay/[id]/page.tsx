import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import PaymentForm from '@/components/payments/PaymentForm'

interface PayPageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PayPageProps) {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        select: { invoiceNumber: true },
    })
    return {
        title: invoice ? `Pay ${invoice.invoiceNumber}` : 'Invoice Not Found',
    }
}

export default async function PayPage({ params }: PayPageProps) {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            client: true,
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    businessName: true,
                    email: true,
                },
            },
            items: true,
        },
    })

    if (!invoice) {
        notFound()
    }

    const balanceDue = invoice.total - invoice.amountPaid

    if (invoice.status === 'paid' || balanceDue <= 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Paid</h1>
                    <p className="text-gray-600">
                        This invoice has already been paid. Thank you!
                    </p>
                </div>
            </div>
        )
    }

    const freelancerName = invoice.user.businessName ||
        `${invoice.user.firstName} ${invoice.user.lastName}`

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Invoice {invoice.invoiceNumber}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        From {freelancerName}
                    </p>
                </div>

                {/* Invoice Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Invoice Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">Bill To</p>
                                <p className="font-semibold text-gray-900">{invoice.client.name}</p>
                                {invoice.client.company && (
                                    <p className="text-gray-600">{invoice.client.company}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Due Date</p>
                                <p className="font-semibold text-gray-900">{formatDate(invoice.dueDate)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="p-6 border-b border-gray-200">
                        <table className="w-full">
                            <thead>
                                <tr className="text-sm text-gray-500">
                                    <th className="text-left pb-2">Description</th>
                                    <th className="text-center pb-2">Qty</th>
                                    <th className="text-right pb-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-900">
                                {invoice.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-2">{item.description}</td>
                                        <td className="py-2 text-center">{item.quantity}</td>
                                        <td className="py-2 text-right">{formatCurrency(item.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="p-6 bg-gray-50">
                        <div className="space-y-2">
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
                            {invoice.amountPaid > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Amount Paid</span>
                                    <span className="text-green-600">-{formatCurrency(invoice.amountPaid)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                <span>Amount Due</span>
                                <span>{formatCurrency(balanceDue)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="p-6">
                        <PaymentForm
                            invoiceId={invoice.id}
                            amount={balanceDue}
                        />
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{invoice.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    Powered by FreelancerShield
                </p>
            </div>
        </div>
    )
}
