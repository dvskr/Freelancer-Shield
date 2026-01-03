"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Star, Trash2, Loader2 } from 'lucide-react'

interface TemplateActionsProps {
    templateId: string
    isDefault: boolean
}

export default function TemplateActions({ templateId, isDefault }: TemplateActionsProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState<string | null>(null)

    const handleSetDefault = async () => {
        setLoading('default')
        try {
            const res = await fetch(`/api/contracts/templates/${templateId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDefault: true }),
            })

            if (res.ok) {
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to set default:', err)
        } finally {
            setLoading(null)
            setIsOpen(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this template?')) return

        setLoading('delete')
        try {
            const res = await fetch(`/api/contracts/templates/${templateId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to delete:', err)
        } finally {
            setLoading(null)
            setIsOpen(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                        {!isDefault && (
                            <button
                                onClick={handleSetDefault}
                                disabled={loading === 'default'}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                {loading === 'default' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Star className="w-4 h-4" />
                                )}
                                Set as Default
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={loading === 'delete'}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            {loading === 'delete' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
