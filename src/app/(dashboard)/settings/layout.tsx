import { requireAuth } from '@/lib/auth'
import SettingsSidebar from '@/components/settings/SettingsSidebar'

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireAuth()

    return (
        <div className="flex gap-8">
            <SettingsSidebar />
            <main className="flex-1 max-w-3xl">
                {children}
            </main>
        </div>
    )
}
