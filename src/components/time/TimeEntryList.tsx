"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Edit2, Trash2, MoreVertical, DollarSign, Tag, CheckCircle } from 'lucide-react'
import { formatDuration, formatTime } from '@/lib/time/utils'
import { formatDate, formatCurrency } from '@/lib/utils'

interface TimeEntry {
    id: string
    description: string
    date: string
    startTime: string | null
    endTime: string | null
    duration: number
    billable: boolean
    billed: boolean
    hourlyRate: number | null
    tags: string[]
    notes: string | null
    client: { id: string; name: string } | null
    project: { id: string; name: string } | null
    milestone: { id: string; name: string } | null
}

interface TimeEntryListProps {
    entries: TimeEntry[]
}

export default function TimeEntryList({ entries }: TimeEntryListProps) {
    const router = useRouter()
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)

    const groupedEntries = entries.reduce((groups, entry) => {
        const date = new Date(entry.date).toISOString().split('T')[0]
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(entry)
        return groups
    }, {} as Record<string, TimeEntry[]>)

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this time entry?')) return

        setDeleting(id)
        try {
            const res = await fetch(`/api/time-entries/${id}`, { method: 'DELETE' })
            if (res.ok) {
                router.refresh()
            } else {
                alert('Failed to delete entry')
            }
        } catch (err) {
            alert('Failed to delete entry')
        } finally {
            setDeleting(null)
        }
    }

    if (entries.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No time entries</h3>
                <p className="text-gray-500">Start tracking your time or adjust the filters.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dayEntries]) => {
                const dayTotal = dayEntries.reduce((sum, e) => sum + e.duration, 0)

                return (
                    <div key={date} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <span className="font-medium text-gray-700">{formatDate(new Date(date))}</span>
                            <span className="text-sm text-gray-500">Total: {formatDuration(dayTotal)}</span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {dayEntries.map((entry) => (
                                <div key={entry.id} className={`p-4 flex items-start gap-4 hover:bg-gray-50 ${entry.billed ? 'bg-green-50/50' : ''}`}>
                                    <div className="w-20 flex-shrink-0 text-center">
                                        <p className="text-lg font-semibold text-gray-900">{formatDuration(entry.duration)}</p>
                                        {entry.startTime && entry.endTime && (
                                            <p className="text-xs text-gray-400">{formatTime(new Date(entry.startTime))} - {formatTime(new Date(entry.endTime))}</p>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{entry.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {entry.project && <span className="text-sm text-blue-600">{entry.project.name}</span>}
                                                    {entry.client && !entry.project && <span className="text-sm text-gray-500">{entry.client.name}</span>}
                                                    {entry.milestone && <span className="text-xs text-gray-400">• {entry.milestone.name}</span>}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {entry.billed && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                        <CheckCircle className="w-3 h-3" />Billed
                                                    </span>
                                                )}
                                                {entry.billable && !entry.billed && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                        <DollarSign className="w-3 h-3" />Billable
                                                    </span>
                                                )}
                                                {entry.hourlyRate && <span className="text-xs text-gray-500">{formatCurrency(entry.hourlyRate)}/hr</span>}
                                            </div>
                                        </div>

                                        {entry.tags.length > 0 && (
                                            <div className="flex items-center gap-1 mt-2">
                                                <Tag className="w-3 h-3 text-gray-400" />
                                                {entry.tags.map((tag) => (<span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>))}
                                            </div>
                                        )}

                                        {entry.notes && <p className="text-sm text-gray-500 mt-2">{entry.notes}</p>}
                                    </div>

                                    <div className="relative">
                                        <button onClick={() => setOpenMenu(openMenu === entry.id ? null : entry.id)} disabled={entry.billed} className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {openMenu === entry.id && !entry.billed && (
                                            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                                <button onClick={() => { setOpenMenu(null); router.push(`/time/${entry.id}/edit`) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                    <Edit2 className="w-4 h-4" />Edit
                                                </button>
                                                <button onClick={() => { setOpenMenu(null); handleDelete(entry.id) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
