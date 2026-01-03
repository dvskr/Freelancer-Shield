import { requirePortalAuth } from '@/lib/portal/protect'
import PortalHeader from '@/components/portal/PortalHeader'
import PortalNav from '@/components/portal/PortalNav'

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { client, freelancer } = await requirePortalAuth()

    return (
        <div className="min-h-screen bg-gray-50">
            <PortalHeader
                clientName={client.name}
                freelancerName={freelancer.businessName || `${freelancer.firstName} ${freelancer.lastName}`}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    <PortalNav />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
