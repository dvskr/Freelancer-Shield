import { CheckCircle, Clock, AlertTriangle, Eye, Send, Ban } from 'lucide-react'

interface InvoiceStatusBadgeProps {
    status: string
}

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'paid':
                return { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-700 border-green-200' }
            case 'overdue':
                return { icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-red-100 text-red-700 border-red-200' }
            case 'viewed':
                return { icon: <Eye className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700 border-purple-200' }
            case 'sent':
                return { icon: <Send className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700 border-blue-200' }
            case 'cancelled':
                return { icon: <Ban className="w-4 h-4" />, color: 'bg-gray-100 text-gray-500 border-gray-200' }
            default:
                return { icon: <Clock className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700 border-gray-200' }
        }
    }

    const config = getStatusConfig()

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border ${config.color}`}>
            {config.icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )
}
