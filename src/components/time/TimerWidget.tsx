"use client"

import { useState, useEffect, useCallback } from 'react'
import { Play, Square, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface Client {
    id: string
    name: string
}

interface Project {
    id: string
    name: string
    clientId: string
}

interface RunningTimer {
    id: string
    description: string
    timerStartedAt: string
    client?: { id: string; name: string } | null
    project?: { id: string; name: string } | null
}

interface TimerWidgetProps {
    clients: Client[]
    projects: Project[]
    initialTimer?: RunningTimer | null
}

export default function TimerWidget({ clients, projects, initialTimer }: TimerWidgetProps) {
    const [runningTimer, setRunningTimer] = useState<RunningTimer | null>(initialTimer || null)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [loading, setLoading] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const [description, setDescription] = useState('')
    const [clientId, setClientId] = useState('')
    const [projectId, setProjectId] = useState('')
    const [billable, setBillable] = useState(true)

    useEffect(() => {
        if (!runningTimer) {
            setElapsedSeconds(0)
            return
        }

        const startTime = new Date(runningTimer.timerStartedAt).getTime()

        const updateElapsed = () => {
            const now = Date.now()
            setElapsedSeconds(Math.floor((now - startTime) / 1000))
        }

        updateElapsed()
        const interval = setInterval(updateElapsed, 1000)

        return () => clearInterval(interval)
    }, [runningTimer])

    const filteredProjects = clientId
        ? projects.filter(p => p.clientId === clientId)
        : projects

    const formatElapsed = useCallback((seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }, [])

    const handleStart = async () => {
        if (!description.trim()) {
            alert('Please enter a description')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/timer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: description.trim(),
                    clientId: clientId || null,
                    projectId: projectId || null,
                    billable,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            const timer = await res.json()
            setRunningTimer(timer)
            setDescription('')
            setExpanded(false)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to start timer')
        } finally {
            setLoading(false)
        }
    }

    const handleStop = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/timer', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            setRunningTimer(null)
            window.location.reload()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to stop timer')
        } finally {
            setLoading(false)
        }
    }

    const handleDiscard = async () => {
        if (!confirm('Discard this timer? Time will not be saved.')) return

        setLoading(true)
        try {
            const res = await fetch('/api/timer', { method: 'DELETE' })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            setRunningTimer(null)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to discard timer')
        } finally {
            setLoading(false)
        }
    }

    if (runningTimer) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <div>
                            <p className="font-medium text-gray-900">{runningTimer.description}</p>
                            <p className="text-sm text-gray-500">
                                {runningTimer.project?.name || runningTimer.client?.name || 'No project'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-mono font-bold text-green-700">
                            {formatElapsed(elapsedSeconds)}
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleStop}
                                disabled={loading}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                title="Stop timer"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleDiscard}
                                disabled={loading}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                title="Discard"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && description.trim()) handleStart() }}
                            placeholder="What are you working on?"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                    </div>

                    <button onClick={() => setExpanded(!expanded)} className="p-2 text-gray-400 hover:text-gray-600">
                        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={handleStart}
                        disabled={loading || !description.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                        Start
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                            <select
                                value={clientId}
                                onChange={(e) => { setClientId(e.target.value); setProjectId('') }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                            >
                                <option value="">No project</option>
                                {filteredProjects.map((project) => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={billable}
                            onChange={(e) => setBillable(e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Billable</span>
                    </label>
                </div>
            )}
        </div>
    )
}
