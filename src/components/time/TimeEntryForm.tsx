"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Loader2, Calendar, DollarSign, Tag, X } from 'lucide-react'
import { formatDuration, parseTimeString, timeToMinutes } from '@/lib/time/utils'

interface Client {
    id: string
    name: string
}

interface Project {
    id: string
    name: string
    clientId: string
}

interface Milestone {
    id: string
    name: string
    projectId: string
}

interface TimeEntryFormProps {
    clients: Client[]
    projects: Project[]
    milestones: Milestone[]
    initialData?: {
        id?: string
        description?: string
        date?: string
        duration?: number
        billable?: boolean
        hourlyRate?: number | null
        clientId?: string | null
        projectId?: string | null
        milestoneId?: string | null
        tags?: string[]
        notes?: string | null
    }
    onSuccess?: () => void
    onCancel?: () => void
}

export default function TimeEntryForm({
    clients,
    projects,
    milestones,
    initialData,
    onSuccess,
    onCancel,
}: TimeEntryFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [description, setDescription] = useState(initialData?.description || '')
    const [date, setDate] = useState(
        initialData?.date || new Date().toISOString().split('T')[0]
    )
    const [durationInput, setDurationInput] = useState(
        initialData?.duration ? formatDuration(initialData.duration) : ''
    )
    const [duration, setDuration] = useState(initialData?.duration || 0)
    const [billable, setBillable] = useState(initialData?.billable ?? true)
    const [hourlyRate, setHourlyRate] = useState<string>(
        initialData?.hourlyRate ? (initialData.hourlyRate / 100).toString() : ''
    )
    const [clientId, setClientId] = useState(initialData?.clientId || '')
    const [projectId, setProjectId] = useState(initialData?.projectId || '')
    const [milestoneId, setMilestoneId] = useState(initialData?.milestoneId || '')
    const [tags, setTags] = useState<string[]>(initialData?.tags || [])
    const [tagInput, setTagInput] = useState('')
    const [notes, setNotes] = useState(initialData?.notes || '')

    const filteredProjects = clientId
        ? projects.filter(p => p.clientId === clientId)
        : projects

    const filteredMilestones = projectId
        ? milestones.filter(m => m.projectId === projectId)
        : []

    useEffect(() => {
        if (durationInput) {
            const parsed = parseTimeString(durationInput)
            if (parsed) {
                setDuration(timeToMinutes(parsed.hours, parsed.minutes))
            }
        }
    }, [durationInput])

    useEffect(() => {
        if (clientId && projectId) {
            const project = projects.find(p => p.id === projectId)
            if (project && project.clientId !== clientId) {
                setProjectId('')
                setMilestoneId('')
            }
        }
    }, [clientId, projects, projectId])

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!description.trim()) {
            setError('Description is required')
            setLoading(false)
            return
        }

        if (duration <= 0) {
            setError('Duration must be greater than 0')
            setLoading(false)
            return
        }

        try {
            const url = initialData?.id
                ? `/api/time-entries/${initialData.id}`
                : '/api/time-entries'

            const method = initialData?.id ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: description.trim(),
                    date,
                    duration,
                    billable,
                    hourlyRate: hourlyRate ? Math.round(parseFloat(hourlyRate) * 100) : null,
                    clientId: clientId || null,
                    projectId: projectId || null,
                    milestoneId: milestoneId || null,
                    tags,
                    notes: notes.trim() || null,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save time entry')
            }

            if (onSuccess) {
                onSuccess()
            } else {
                router.push('/time')
                router.refresh()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    What did you work on? *
                </label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Website redesign - homepage layout"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={durationInput}
                            onChange={(e) => setDurationInput(e.target.value)}
                            placeholder="1h 30m or 1:30"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                            required
                        />
                    </div>
                    {duration > 0 && <p className="text-xs text-gray-500 mt-1">{formatDuration(duration)}</p>}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <select
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                        <option value="">No client</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                        <option value="">No project</option>
                        {filteredProjects.map((project) => (
                            <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Milestone</label>
                    <select
                        value={milestoneId}
                        onChange={(e) => setMilestoneId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        disabled={!projectId}
                    >
                        <option value="">No milestone</option>
                        {filteredMilestones.map((milestone) => (
                            <option key={milestone.id} value={milestone.id}>{milestone.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={billable}
                        onChange={(e) => setBillable(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Billable</span>
                </label>

                {billable && (
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">Rate:</label>
                        <div className="relative w-32">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="number"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                className="w-full pl-8 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                            />
                        </div>
                        <span className="text-sm text-gray-500">/hr</span>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            {tag}
                            <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
                            placeholder="Add a tag"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                    </div>
                    <button type="button" onClick={handleAddTag} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Add</button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional details..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {initialData?.id ? 'Update Entry' : 'Save Entry'}
                </button>
            </div>
        </form>
    )
}
