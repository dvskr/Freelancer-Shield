import { requireAuth } from '@/lib/auth'
import ClientInsights from '@/components/analytics/ClientInsights'

export const metadata = { title: 'Client Insights | FreelancerShield' }

export default async function ClientInsightsPage() {
    await requireAuth()
    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-gray-900">Client Insights</h1><p className="text-gray-600 mt-1">Analyze client value and engagement</p></div>
            <ClientInsights />
        </div>
    )
}
