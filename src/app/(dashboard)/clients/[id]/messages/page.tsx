import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FreelancerMessageThread from '@/components/clients/FreelancerMessageThread'

interface ClientMessagesPageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ClientMessagesPageProps) {
    const { id } = await params
    const client = await prisma.client.findUnique({
        where: { id },
        select: { name: true },
    })
    return {
        title: client ? `Messages - ${client.name} | FreelancerShield` : 'Client Not Found',
    }
}

export default async function ClientMessagesPage({ params }: ClientMessagesPageProps) {
    const { id } = await params
    const { profile } = await requireAuth()

    const client = await prisma.client.findUnique({
        where: { id, userId: profile.id },
    })

    if (!client) {
        notFound()
    }

    const messages = await prisma.portalMessage.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: 'asc' },
    })

    // Mark unread messages as read
    await prisma.portalMessage.updateMany({
        where: {
            clientId: client.id,
            senderType: 'client',
            readAt: null,
        },
        data: { readAt: new Date() },
    })

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href={`/clients/${client.id}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {client.name}
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Messages with {client.name}</h1>
            </div>

            <FreelancerMessageThread
                messages={messages}
                clientId={client.id}
                clientName={client.name}
            />
        </div>
    )
}
