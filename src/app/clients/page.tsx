import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { Plus, Users, Mail, Phone, Building2 } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import ClientSearch from '@/components/clients/client-search'

export const metadata = {
    title: 'Clients | FreelancerShield',
}

interface ClientsPageProps {
    searchParams: Promise<{ q?: string }>
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
    const { profile } = await requireAuth()
    const params = await searchParams
    const searchQuery = params.q || ''

    const clients = await prisma.client.findMany({
        where: {
            userId: profile.id,
            ...(searchQuery && {
                OR: [
                    { name: { contains: searchQuery, mode: 'insensitive' } },
                    { email: { contains: searchQuery, mode: 'insensitive' } },
                    { company: { contains: searchQuery, mode: 'insensitive' } },
                ],
            }),
        },
        include: {
            _count: {
                select: {
                    projects: true,
                    invoices: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                    <p className="text-gray-600 mt-1">
                        Manage your client relationships
                    </p>
                </div>
                <Link
                    href="/clients/new"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Client
                </Link>
            </div>

            {/* Search */}
            <ClientSearch initialQuery={searchQuery} />

            {/* Client List */}
            {clients.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchQuery ? 'No clients found' : 'No clients yet'}
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {searchQuery
                            ? `No clients match "${searchQuery}". Try a different search.`
                            : 'Add your first client to start tracking projects and sending invoices.'}
                    </p>
                    {!searchQuery && (
                        <Link
                            href="/clients/new"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Client
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.map((client) => (
                        <Link
                            key={client.id}
                            href={`/clients/${client.id}`}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-lg">
                                        {client.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {formatDate(client.createdAt)}
                                </span>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-1">{client.name}</h3>

                            {client.company && (
                                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                                    <Building2 className="w-4 h-4" />
                                    {client.company}
                                </p>
                            )}

                            <div className="space-y-1 mb-4">
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    {client.email}
                                </p>
                                {client.phone && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        {client.phone}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                                <span className="text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">{client._count.projects}</span> projects
                                </span>
                                <span className="text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">{client._count.invoices}</span> invoices
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
