import { requirePortalAuth } from '@/lib/portal/protect'
import prisma from '@/lib/prisma'
import MessageThread from '@/components/portal/MessageThread'

export const metadata = {
    title: 'Messages | Client Portal',
}

export default async function PortalMessagesPage() {
    const { client, freelancer } = await requirePortalAuth()

    const messages = await prisma.portalMessage.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: 'asc' },
    })

    // Mark unread messages as read
    await prisma.portalMessage.updateMany({
        where: {
            clientId: client.id,
            senderType: 'freelancer',
            readAt: null,
        },
        data: { readAt: new Date() },
    })

    const freelancerName = freelancer.businessName ||
        `${freelancer.firstName} ${freelancer.lastName}`

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 mt-1">Chat with {freelancerName}</p>
            </div>

            <MessageThread
                messages={messages}
                clientId={client.id}
                freelancerName={freelancerName}
                clientName={client.name}
            />
        </div>
    )
}
