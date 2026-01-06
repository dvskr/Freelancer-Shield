import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ThankYouPageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ session_id?: string }>
}

export const metadata = {
    title: 'Payment Successful | FreelancerShield',
}

export default async function ThankYouPage({ params, searchParams }: ThankYouPageProps) {
    const { id } = await params
    const { session_id } = await searchParams

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            client: true,
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    businessName: true,
                },
            },
        },
    })

    if (!invoice) {
        notFound()
    }

    const freelancerName = invoice.user.businessName ||
        `${invoice.user.firstName} ${invoice.user.lastName}`

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Payment Successful!
                </h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your payment. A receipt has been sent to your email.
                </p>

                {/* Payment Details */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-left">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Invoice</span>
                            <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Amount Paid</span>
                            <span className="font-semibold text-green-600">{formatCurrency(invoice.total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Paid To</span>
                            <span className="font-medium text-gray-900">{freelancerName}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href={`/api/invoices/${invoice.id}/pdf`}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                    >
                        <Download className="w-5 h-5" />
                        Download Receipt
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-sm text-gray-500 mt-8">
                    Questions? Contact {freelancerName}
                </p>
            </div>
        </div>
    )
}
