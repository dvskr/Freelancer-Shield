import { requireAuth } from '@/lib/auth'
import InvoiceAnalytics from '@/components/analytics/InvoiceAnalytics'

export const metadata = { title: 'Invoice Analytics | FreelancerShield' }

export default async function InvoiceAnalyticsPage() {
    await requireAuth()
    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-gray-900">Invoice Analytics</h1><p className="text-gray-600 mt-1">Track invoicing and payment collection</p></div>
            <InvoiceAnalytics />
        </div>
    )
}
