import { requireAuth } from '@/lib/auth'
import SecuritySettings from '@/components/settings/SecuritySettings'

export const metadata = { title: 'Security Settings | FreelancerShield' }

export default async function SecuritySettingsPage() {
    await requireAuth()
    return (
        <div className="space-y-6">
            <div><h2 className="text-xl font-bold text-gray-900">Security</h2><p className="text-gray-600 mt-1">Manage your account security settings</p></div>
            <SecuritySettings />
        </div>
    )
}
