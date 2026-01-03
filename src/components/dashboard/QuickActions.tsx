import Link from 'next/link'
import { FileText, FolderPlus, UserPlus, Clock, Receipt } from 'lucide-react'

const actions = [
    { href: '/invoices/new', label: 'Create Invoice', icon: FileText, color: 'bg-blue-500' },
    { href: '/projects/new', label: 'New Project', icon: FolderPlus, color: 'bg-green-500' },
    { href: '/clients/new', label: 'Add Client', icon: UserPlus, color: 'bg-purple-500' },
    { href: '/time/new', label: 'Log Time', icon: Clock, color: 'bg-orange-500' },
    { href: '/time/invoice', label: 'Bill Time', icon: Receipt, color: 'bg-teal-500' },
]

export default function QuickActions() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
                {actions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className={`p-2 ${action.color} rounded-lg`}>
                            <action.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-700">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
