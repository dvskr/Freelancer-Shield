"use client"

import { useState, useEffect, useCallback } from 'react'
import { Clock, Square, X } from 'lucide-react'
import Link from 'next/link'

interface RunningTimer {
    id: string
    description: string
    timerStartedAt: string
    project?: { name: string } | null
}

export default function GlobalTimerBar() {
    const [timer, setTimer] = useState<RunningTimer | null>(null)
    const [elapsed, setElapsed] = useState(0)
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const fetchTimer = async () => {
            try {
                const res = await fetch('/api/timer')
                if (res.ok) {
                    const data = await res.json()
                    setTimer(data)
                }
            } catch (err) {
                console.error('Failed to fetch timer:', err)
            }
        }

        fetchTimer()
        const interval = setInterval(fetchTimer, 60000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!timer) {
            setElapsed(0)
            return
        }

        const startTime = new Date(timer.timerStartedAt).getTime()
        const updateElapsed = () => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000))
        }

        updateElapsed()
        const interval = setInterval(updateElapsed, 1000)
        return () => clearInterval(interval)
    }, [timer])

    const formatElapsed = useCallback((seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }, [])

    const handleStop = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/timer', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            if (res.ok) {
                setTimer(null)
                window.location.reload()
            }
        } catch (err) {
            console.error('Failed to stop timer:', err)
        } finally {
            setLoading(false)
        }
    }

    if (!timer || !visible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-green-600 text-white shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <Clock className="w-5 h-5" />
                    <div>
                        <p className="font-medium">{timer.description}</p>
                        {timer.project && <p className="text-xs text-green-100">{timer.project.name}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xl font-mono font-bold">{formatElapsed(elapsed)}</span>

                    <button onClick={handleStop} disabled={loading} className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors" title="Stop timer">
                        <Square className="w-4 h-4" />
                    </button>

                    <Link href="/time" className="px-3 py-1.5 text-sm bg-green-700 hover:bg-green-800 rounded-lg">View</Link>

                    <button onClick={() => setVisible(false)} className="p-1 text-green-100 hover:text-white" title="Hide">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
