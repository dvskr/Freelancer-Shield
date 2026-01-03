import { requireAuth } from '@/lib/auth'
import BusinessSettings from '@/components/settings/BusinessSettings'

export const metadata = { title: 'Business Settings | FreelancerShield' }

export default async function BusinessSettingsPage() {
    await requireAuth()
    return (
        <div className="space-y-6">
            <div><h2 className="text-xl font-bold text-gray-900">Business Information</h2><p className="text-gray-600 mt-1">Manage your business details for invoices and contracts</p></div>
            <BusinessSettings />
        </div>
    )
}
