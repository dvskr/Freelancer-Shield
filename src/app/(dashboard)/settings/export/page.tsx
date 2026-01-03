import { requireAuth } from '@/lib/auth'
import DataExport from '@/components/settings/DataExport'

export const metadata = { title: 'Export & Backup | FreelancerShield' }

export default async function ExportSettingsPage() {
    await requireAuth()
    return (
        <div className="space-y-6">
            <div><h2 className="text-xl font-bold text-gray-900">Export & Data</h2><p className="text-gray-600 mt-1">Export your data and manage your account</p></div>
            <DataExport />
        </div>
    )
}
