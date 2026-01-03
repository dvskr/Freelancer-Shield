"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react'
import { getWeekDates, formatDuration, isSameDay } from '@/lib/time/utils'

interface TimeEntry {
    id: string
    description: string
    date: string
    duration: number
    project: { id: string; name: string } | null
}

interface WeeklyTimesheetProps {
    entries: TimeEntry[]
}

export default function WeeklyTimesheet({ entries }: WeeklyTimesheetProps) {
    const router = useRouter()
    const [currentDate, setCurrentDate] = useState(new Date())

    const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    const entriesByDay = useMemo(() => {
        const map: Record<string, TimeEntry[]> = {}
        entries.forEach((entry) => {
            const dateKey = new Date(entry.date).toISOString().split('T')[0]
            if (!map[dateKey]) map[dateKey] = []
            map[dateKey].push(entry)
        })
        return map
    }, [entries])

    const weekEntries = weekDates.map((date) => {
        const key = date.toISOString().split('T')[0]
        return entriesByDay[key] || []
    })

    const dailyTotals = weekEntries.map((dayEntries) =>
        dayEntries.reduce((sum, e) => sum + e.duration, 0)
    )

    const weekTotal = dailyTotals.reduce((sum, d) => sum + d, 0)

    const prevWeek = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() - 7)
        setCurrentDate(newDate)
    }

    const nextWeek = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + 7)
        setCurrentDate(newDate)
    }

    const goToday = () => setCurrentDate(new Date())

    const formatWeekRange = () => {
        const start = weekDates[0]
        const end = weekDates[6]
        const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
        const endMonth = end.toLocaleDateString('en-US', { month: 'short' })

        if (startMonth === endMonth) {
            return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`
        }
        return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`
    }

    const today = new Date()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium text-gray-900 min-w-[200px] text-center">{formatWeekRange()}</span>
                    <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button onClick={goToday} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Today</button>
                </div>

                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-gray-900">Week Total: {formatDuration(weekTotal)}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {weekDates.map((date, i) => (
                        <div key={i} className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${isSameDay(date, today) ? 'bg-blue-50' : ''}`}>
                            <p className="text-xs text-gray-500 font-medium">{dayNames[i]}</p>
                            <p className={`text-lg font-semibold ${isSameDay(date, today) ? 'text-blue-600' : 'text-gray-900'}`}>{date.getDate()}</p>
                            <p className="text-sm text-gray-500 mt-1">{formatDuration(dailyTotals[i])}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 min-h-[400px]">
                    {weekDates.map((date, i) => (
                        <div key={i} className={`border-r border-gray-200 last:border-r-0 p-2 ${isSameDay(date, today) ? 'bg-blue-50/30' : ''}`}>
                            <div className="space-y-2">
                                {weekEntries[i].slice(0, 5).map((entry) => (
                                    <div key={entry.id} onClick={() => router.push(`/time/${entry.id}/edit`)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer text-xs">
                                        <p className="font-medium text-gray-900 truncate">{entry.description}</p>
                                        <p className="text-gray-500 mt-0.5">{formatDuration(entry.duration)}</p>
                                    </div>
                                ))}
                                {weekEntries[i].length > 5 && (
                                    <p className="text-xs text-gray-400 text-center">+{weekEntries[i].length - 5} more</p>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    const dateStr = date.toISOString().split('T')[0]
                                    router.push(`/time/new?date=${dateStr}`)
                                }}
                                className="w-full mt-2 p-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-1"
                            >
                                <Plus className="w-3 h-3" />Add
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
