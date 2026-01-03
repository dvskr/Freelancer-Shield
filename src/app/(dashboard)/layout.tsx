import { requireAuth } from '@/lib/auth'
import DashboardSidebar from '@/components/layout/dashboard-sidebar'
import DashboardHeader from '@/components/layout/dashboard-header'

export default async function DashboardGroupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { profile } = await requireAuth()

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={profile} />
            <div className="flex">
                <DashboardSidebar />
                <main className="flex-1 p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}
