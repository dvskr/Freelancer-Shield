"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Loader2 } from 'lucide-react'

interface StatusChangerProps {
    projectId: string
    currentStatus: string
}

const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
]

export default function StatusChanger({ projectId, currentStatus }: StatusChangerProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const currentOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0]

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) {
            setIsOpen(false)
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })

            if (res.ok) {
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to update status:', err)
        } finally {
            setLoading(false)
            setIsOpen(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${currentOption.color} border-current/20 hover:border-current/40`}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        {currentOption.label}
                        <ChevronDown className="w-4 h-4" />
                    </>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleStatusChange(option.value)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${option.value === currentStatus ? 'font-medium' : ''
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`} />
                                {option.label}
                                {option.value === currentStatus && (
                                    <span className="ml-auto text-xs text-gray-400">Current</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
