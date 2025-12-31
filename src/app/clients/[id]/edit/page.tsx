import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import ClientForm from '@/components/clients/client-form'

interface EditClientPageProps {
    params: Promise<{ id: string }>
}

export const metadata = {
    title: 'Edit Client | FreelancerShield',
}

export default async function EditClientPage({ params }: EditClientPageProps) {
    const { profile } = await requireAuth()
    const { id } = await params

    const client = await prisma.client.findUnique({
        where: { id, userId: profile.id },
    })

    if (!client) {
        notFound()
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link
                    href={`/clients/${client.id}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Client
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Client</h1>
                <p className="text-gray-600 mt-1">
                    Update information for {client.name}
                </p>
            </div>

            {/* Form */}
            <ClientForm
                mode="edit"
                initialData={{
                    id: client.id,
                    name: client.name,
                    email: client.email,
                    phone: client.phone || '',
                    company: client.company || '',
                    address: client.address || '',
                    city: client.city || '',
                    state: client.state || '',
                    zipCode: client.zipCode || '',
                    country: client.country,
                    notes: client.notes || '',
                }}
            />
        </div>
    )
}
