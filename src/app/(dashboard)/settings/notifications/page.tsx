import { requireAuth } from '@/lib/auth'
import NotificationSettings from '@/components/settings/NotificationSettings'
import { DEFAULT_NOTIFICATION_SETTINGS, NotificationSettings as NSettings } from '@/lib/types/settings'

export const metadata = { title: 'Notification Settings | FreelancerShield' }

export default async function NotificationSettingsPage() {
    const { profile } = await requireAuth()

    // Merge saved settings with defaults to ensure all fields exist
    const savedSettings = (profile.notificationSettings as NSettings) || {}
    const initialSettings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...savedSettings }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                <p className="text-gray-600 mt-1">Choose what notifications you receive</p>
            </div>
            <NotificationSettings initialSettings={initialSettings} />
        </div>
    )
}
