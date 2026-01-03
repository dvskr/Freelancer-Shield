import Link from 'next/link'
import { AlertTriangle, FileText, CheckSquare, Clock, ArrowRight } from 'lucide-react'

interface AlertsCardProps {
    alerts: {
        pendingInvoices: number
        overdueInvoices: number
        pendingMilestones: number
    }
}

export default function AlertsCard({ alerts }: AlertsCardProps) {
    const hasAlerts = alerts.overdueInvoices > 0 || alerts.pendingInvoices > 0 || alerts.pendingMilestones > 0

    if (!hasAlerts) return null

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Action Required</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {alerts.overdueInvoices > 0 && (
                    <Link
                        href="/invoices?status=overdue"
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Clock className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Overdue Invoices</p>
                                <p className="text-xs text-gray-500">{alerts.overdueInvoices} need attention</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                )}

                {alerts.pendingInvoices > 0 && (
                    <Link
                        href="/invoices?status=draft"
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Draft Invoices</p>
                                <p className="text-xs text-gray-500">{alerts.pendingInvoices} to send</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                )}

                {alerts.pendingMilestones > 0 && (
                    <Link
                        href="/projects?filter=pending"
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <CheckSquare className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Pending Approvals</p>
                                <p className="text-xs text-gray-500">{alerts.pendingMilestones} milestones</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                )}
            </div>
        </div>
    )
}
