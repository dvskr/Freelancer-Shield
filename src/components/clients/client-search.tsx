"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'

interface ClientSearchProps {
    initialQuery: string
}

export default function ClientSearch({ initialQuery }: ClientSearchProps) {
    const router = useRouter()
    const [query, setQuery] = useState(initialQuery)
    const [isPending, startTransition] = useTransition()

    const handleSearch = (value: string) => {
        setQuery(value)
        startTransition(() => {
            if (value) {
                router.push(`/clients?q=${encodeURIComponent(value)}`)
            } else {
                router.push('/clients')
            }
        })
    }

    const clearSearch = () => {
        setQuery('')
        startTransition(() => {
            router.push('/clients')
        })
    }

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search clients by name, email, or company..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {isPending ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
            ) : query ? (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
            ) : null}
        </div>
    )
}
