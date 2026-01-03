import { requireAuth } from '@/lib/auth'
import ProfileSettings from '@/components/settings/ProfileSettings'

export const metadata = { title: 'Profile Settings | FreelancerShield' }

export default async function SettingsPage() {
    const { profile } = await requireAuth()

    return (
        <div className="space-y-6">
            <div><h2 className="text-xl font-bold text-gray-900">Profile</h2><p className="text-gray-600 mt-1">Manage your personal information</p></div>
            <ProfileSettings profile={profile} />
        </div>
    )
}
