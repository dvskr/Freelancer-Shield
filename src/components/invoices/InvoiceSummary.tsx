import { formatCurrency } from '@/lib/utils'
import { DollarSign, Calendar, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface InvoiceSummaryProps {
    invoiceNumber: string
    status: string
    total: number
    amountPaid: number
    dueDate: Date
    issueDate: Date
}

export default function InvoiceSummary({
    invoiceNumber,
    status,
    total,
    amountPaid,
    dueDate,
    issueDate,
}: InvoiceSummaryProps) {
    const balance = total - amountPaid
    const isOverdue = status !== 'paid' && status !== 'cancelled' && new Date(dueDate) < new Date()

    const getStatusInfo = () => {
        switch (status) {
            case 'paid':
                return { icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' }
            case 'overdue':
                return { icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-100' }
            default:
                return { icon: <Clock className="w-5 h-5" />, color: 'text-gray-600', bg: 'bg-gray-100' }
        }
    }

    const statusInfo = getStatusInfo()

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm text-gray-500">Invoice</p>
                    <p className="text-xl font-bold text-gray-900">{invoiceNumber}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span className="font-medium capitalize">{status}</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(total)}</p>
                    </div>
                </div>

                {amountPaid > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Amount Paid</p>
                            <p className="text-lg font-semibold text-green-600">{formatCurrency(amountPaid)}</p>
                        </div>
                    </div>
                )}

                {balance > 0 && status !== 'paid' && (
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-100' : 'bg-orange-100'}`}>
                            <DollarSign className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-orange-600'}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Balance Due</p>
                            <p className={`text-lg font-semibold ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                                {formatCurrency(balance)}
                            </p>
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Issue Date</span>
                        <span className="text-gray-900">{formatDate(issueDate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Due Date</span>
                        <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}>
                            {formatDate(dueDate)}
                            {isOverdue && ' (Overdue)'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
