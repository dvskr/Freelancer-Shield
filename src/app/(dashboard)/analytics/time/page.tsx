import { requireAuth } from '@/lib/auth'
import TimeAnalytics from '@/components/analytics/TimeAnalytics'

export const metadata = { title: 'Time Analytics | FreelancerShield' }

export default async function TimeAnalyticsPage() {
    await requireAuth()
    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-gray-900">Time Analytics</h1><p className="text-gray-600 mt-1">Track productivity and utilization</p></div>
            <TimeAnalytics />
        </div>
    )
}
