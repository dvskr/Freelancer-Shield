import { requireAuth } from '@/lib/auth'
import NotificationSettings from '@/components/settings/NotificationSettings'

export const metadata = { title: 'Notification Settings | FreelancerShield' }

export default async function NotificationSettingsPage() {
    await requireAuth()
    return (
        <div className="space-y-6">
            <div><h2 className="text-xl font-bold text-gray-900">Notifications</h2><p className="text-gray-600 mt-1">Choose what notifications you receive</p></div>
            <NotificationSettings />
        </div>
    )
}
