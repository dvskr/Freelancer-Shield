"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, CheckSquare, Square } from 'lucide-react'
import { formatDuration, calculateAmount } from '@/lib/time/utils'
import { formatCurrency, formatDate } from '@/lib/utils'

interface TimeEntry {
    id: string
    description: string
    date: string
    duration: number
    hourlyRate: number | null
    client: { id: string; name: string } | null
    project: { id: string; name: string } | null
}

interface Client {
    id: string
    name: string
}

interface TimeToInvoiceProps {
    entries: TimeEntry[]
    clients: Client[]
}

export default function TimeToInvoice({ entries: allEntries, clients }: TimeToInvoiceProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [clientId, setClientId] = useState('')
    const [projectId, setProjectId] = useState('')
    const [groupByProject, setGroupByProject] = useState(true)
    const [dueDate, setDueDate] = useState(() => {
        const date = new Date()
        date.setDate(date.getDate() + 14)
        return date.toISOString().split('T')[0]
    })

    const unbilledEntries = allEntries.filter(e => e.hourlyRate)
    const filteredEntries = clientId ? unbilledEntries.filter(e => e.client?.id === clientId) : unbilledEntries
    const selectedEntries = filteredEntries.filter(e => selectedIds.has(e.id))

    const totalMinutes = selectedEntries.reduce((sum, e) => sum + e.duration, 0)
    const totalAmount = selectedEntries.reduce((sum, e) => {
        if (!e.hourlyRate) return sum
        return sum + calculateAmount(e.duration, e.hourlyRate)
    }, 0)

    const toggleEntry = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
    }

    const toggleAll = () => {
        if (selectedIds.size === filteredEntries.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredEntries.map(e => e.id)))
        }
    }

    const handleCreateInvoice = async () => {
        if (selectedIds.size === 0) { alert('Please select at least one time entry'); return }
        if (!clientId) { alert('Please select a client'); return }

        setLoading(true)
        try {
            const res = await fetch('/api/time-entries/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timeEntryIds: Array.from(selectedIds),
                    clientId,
                    projectId: projectId || null,
                    dueDate,
                    groupByProject,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            const invoice = await res.json()
            router.push(`/invoices/${invoice.id}`)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create invoice')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Create Invoice from Time</h2>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                        <select value={clientId} onChange={(e) => { setClientId(e.target.value); setSelectedIds(new Set()) }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" required>
                            <option value="">Select client</option>
                            {clients.map((client) => (<option key={client.id} value={client.id}>{client.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={groupByProject} onChange={(e) => setGroupByProject(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                            <span className="text-sm text-gray-700">Group by project</span>
                        </label>
                    </div>
                </div>

                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-6 p-4 bg-blue-50 rounded-lg">
                        <div><p className="text-sm text-blue-700">Selected</p><p className="text-lg font-semibold text-blue-900">{selectedIds.size} entries</p></div>
                        <div><p className="text-sm text-blue-700">Total Time</p><p className="text-lg font-semibold text-blue-900">{formatDuration(totalMinutes)}</p></div>
                        <div><p className="text-sm text-blue-700">Total Amount</p><p className="text-lg font-semibold text-blue-900">{formatCurrency(totalAmount)}</p></div>
                        <div className="ml-auto">
                            <button onClick={handleCreateInvoice} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}Create Invoice
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {clientId && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                            {selectedIds.size === filteredEntries.length ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                            Select All ({filteredEntries.length})
                        </button>
                    </div>

                    {filteredEntries.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No unbilled time entries for this client</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredEntries.map((entry) => (
                                <div key={entry.id} onClick={() => toggleEntry(entry.id)} className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 ${selectedIds.has(entry.id) ? 'bg-blue-50' : ''}`}>
                                    {selectedIds.has(entry.id) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{entry.description}</p>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span>{formatDate(new Date(entry.date))}</span>
                                            {entry.project && <span>• {entry.project.name}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">{formatDuration(entry.duration)}</p>
                                        {entry.hourlyRate && <p className="text-sm text-gray-500">{formatCurrency(calculateAmount(entry.duration, entry.hourlyRate))}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
