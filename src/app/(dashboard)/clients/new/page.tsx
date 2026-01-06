import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ClientForm from '@/components/clients/client-form'

export const metadata = {
    title: 'Add Client | FreelancerShield',
}

export default async function NewClientPage() {
    await requireAuth()

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/clients"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Clients
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Add New Client</h1>
                <p className="text-gray-600 mt-1">
                    Enter your client's information below.
                </p>
            </div>

            {/* Form */}
            <ClientForm mode="create" />
        </div>
    )
}
