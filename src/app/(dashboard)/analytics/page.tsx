import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { DollarSign, Users, FolderKanban, FileText, Clock, ArrowRight } from 'lucide-react'
import ActivityFeed from '@/components/dashboard/ActivityFeed'

export const metadata = { title: 'Analytics | FreelancerShield' }

const analyticsPages = [
    { href: '/analytics/revenue', title: 'Revenue Analytics', description: 'Track income trends and financial performance', icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { href: '/analytics/clients', title: 'Client Insights', description: 'Analyze client value and engagement', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { href: '/analytics/projects', title: 'Project Health', description: 'Monitor project progress and risks', icon: FolderKanban, color: 'bg-purple-100 text-purple-600' },
    { href: '/analytics/invoices', title: 'Invoice Analytics', description: 'Track invoicing and collection efficiency', icon: FileText, color: 'bg-orange-100 text-orange-600' },
    { href: '/analytics/time', title: 'Time Analytics', description: 'Measure productivity and utilization', icon: Clock, color: 'bg-teal-100 text-teal-600' },
]

export default async function AnalyticsPage() {
    await requireAuth()
    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-gray-900">Analytics</h1><p className="text-gray-600 mt-1">Insights into your freelance business</p></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsPages.map((page) => (
                    <Link key={page.href} href={page.href} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4"><div className={`p-3 rounded-lg ${page.color}`}><page.icon className="w-6 h-6" /></div><ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" /></div>
                        <h3 className="font-semibold text-gray-900 mb-1">{page.title}</h3><p className="text-sm text-gray-500">{page.description}</p>
                    </Link>
                ))}
            </div>
            <ActivityFeed />
        </div>
    )
}
