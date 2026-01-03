import { requireAuth } from '@/lib/auth'
import InvoiceSettings from '@/components/settings/InvoiceSettings'

export const metadata = { title: 'Invoice Settings | FreelancerShield' }

export default async function InvoiceSettingsPage() {
    await requireAuth()
    return (
        <div className="space-y-6">
            <div><h2 className="text-xl font-bold text-gray-900">Invoice Settings</h2><p className="text-gray-600 mt-1">Customize your invoice defaults and appearance</p></div>
            <InvoiceSettings />
        </div>
    )
}
