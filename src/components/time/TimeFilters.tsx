"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Filter, X } from 'lucide-react'

interface Client {
    id: string
    name: string
}

interface Project {
    id: string
    name: string
    clientId: string
}

interface TimeFiltersProps {
    clients: Client[]
    projects: Project[]
    currentFilters: {
        startDate?: string
        endDate?: string
        clientId?: string
        projectId?: string
        billable?: string
    }
}

export default function TimeFilters({ clients, projects, currentFilters }: TimeFiltersProps) {
    const router = useRouter()

    const [startDate, setStartDate] = useState(currentFilters.startDate || '')
    const [endDate, setEndDate] = useState(currentFilters.endDate || '')
    const [clientId, setClientId] = useState(currentFilters.clientId || '')
    const [projectId, setProjectId] = useState(currentFilters.projectId || '')
    const [billable, setBillable] = useState(currentFilters.billable || '')

    const filteredProjects = clientId
        ? projects.filter(p => p.clientId === clientId)
        : projects

    const applyFilters = () => {
        const params = new URLSearchParams()
        if (startDate) params.set('startDate', startDate)
        if (endDate) params.set('endDate', endDate)
        if (clientId) params.set('clientId', clientId)
        if (projectId) params.set('projectId', projectId)
        if (billable) params.set('billable', billable)

        router.push(`/time?${params.toString()}`)
    }

    const clearFilters = () => {
        setStartDate('')
        setEndDate('')
        setClientId('')
        setProjectId('')
        setBillable('')
        router.push('/time')
    }

    const setPreset = (preset: 'today' | 'week' | 'month') => {
        const now = new Date()
        let start: Date
        const end = new Date()

        switch (preset) {
            case 'today':
                start = new Date()
                break
            case 'week':
                const day = now.getDay()
                const diff = now.getDate() - day + (day === 0 ? -6 : 1)
                start = new Date(now)
                start.setDate(diff)
                break
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1)
                break
        }

        start.setHours(0, 0, 0, 0)
        setStartDate(start.toISOString().split('T')[0])
        setEndDate(end.toISOString().split('T')[0])
    }

    const hasFilters = startDate || endDate || clientId || projectId || billable

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-700">Filters</span>

                <div className="flex items-center gap-1 ml-4">
                    <button onClick={() => setPreset('today')} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">Today</button>
                    <button onClick={() => setPreset('week')} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">This Week</button>
                    <button onClick={() => setPreset('month')} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">This Month</button>
                </div>

                {hasFilters && (
                    <button onClick={clearFilters} className="ml-auto text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        <X className="w-4 h-4" />Clear
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Client</label>
                    <select value={clientId} onChange={(e) => { setClientId(e.target.value); setProjectId('') }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900">
                        <option value="">All clients</option>
                        {clients.map((client) => (<option key={client.id} value={client.id}>{client.name}</option>))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Project</label>
                    <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900">
                        <option value="">All projects</option>
                        {filteredProjects.map((project) => (<option key={project.id} value={project.id}>{project.name}</option>))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Billable</label>
                    <select value={billable} onChange={(e) => setBillable(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900">
                        <option value="">All</option>
                        <option value="true">Billable</option>
                        <option value="false">Non-billable</option>
                    </select>
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Apply Filters</button>
            </div>
        </div>
    )
}
