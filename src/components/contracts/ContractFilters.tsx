'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface ContractFiltersProps {
    clients: { id: string; name: string }[]
    initialFilters: {
        status: string
        clientId: string
    }
}

export default function ContractFilters({ clients, initialFilters }: ContractFiltersProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [filters, setFilters] = useState(initialFilters)

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        const updated = { ...filters, ...newFilters }
        setFilters(updated)

        startTransition(() => {
            const params = new URLSearchParams()
            if (updated.status && updated.status !== 'all') params.set('status', updated.status)
            if (updated.clientId) params.set('clientId', updated.clientId)
            router.push(`/contracts?${params.toString()}`)
        })
    }

    return (
        <div className="flex gap-4 items-center">
            <select
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
            >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="signed">Signed</option>
            </select>

            <select
                value={filters.clientId}
                onChange={(e) => updateFilters({ clientId: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Clients</option>
                {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                ))}
            </select>

            {isPending && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
        </div>
    )
}
