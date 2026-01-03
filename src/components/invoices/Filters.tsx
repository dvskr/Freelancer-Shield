'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'

interface FiltersProps {
    clients: { id: string; name: string }[]
    initialFilters: {
        status: string
        clientId: string
        q: string
    }
}

export default function Filters({ clients, initialFilters }: FiltersProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [filters, setFilters] = useState(initialFilters)

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        const updated = { ...filters, ...newFilters }
        setFilters(updated)

        startTransition(() => {
            const params = new URLSearchParams()
            if (updated.q) params.set('q', updated.q)
            if (updated.status && updated.status !== 'all') params.set('status', updated.status)
            if (updated.clientId) params.set('clientId', updated.clientId)
            router.push(`/invoices?${params.toString()}`)
        })
    }

    const clearFilters = () => {
        setFilters({ status: 'all', clientId: '', q: '' })
        startTransition(() => router.push('/invoices'))
    }

    const hasFilters = filters.q || filters.status !== 'all' || filters.clientId

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={filters.q}
                    onChange={(e) => updateFilters({ q: e.target.value })}
                    placeholder="Search invoices..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 options:outline-none"
                />
                {isPending && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
            </div>

            {/* Status Filter */}
            <select
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white min-w-[150px] focus:ring-2 focus:ring-blue-500"
            >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
            </select>

            {/* Client Filter */}
            <select
                value={filters.clientId}
                onChange={(e) => updateFilters({ clientId: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white min-w-[180px] focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Clients</option>
                {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                        {client.name}
                    </option>
                ))}
            </select>

            {/* Clear */}
            {hasFilters && (
                <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <X className="w-4 h-4" />
                    Clear
                </button>
            )}
        </div>
    )
}
