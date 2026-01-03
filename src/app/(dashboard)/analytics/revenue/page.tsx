import { requireAuth } from '@/lib/auth'
import RevenueAnalytics from '@/components/analytics/RevenueAnalytics'

export const metadata = {
    title: 'Revenue Analytics | FreelancerShield',
}

export default async function RevenueAnalyticsPage() {
    await requireAuth()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
                <p className="text-gray-600 mt-1">Track your income and financial trends</p>
            </div>

            <RevenueAnalytics />
        </div>
    )
}
