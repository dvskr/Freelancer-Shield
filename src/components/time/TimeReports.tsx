"use client"

import { useState, useEffect, useCallback } from 'react'
import { BarChart3, Clock, DollarSign, TrendingUp, Loader2, Download } from 'lucide-react'
import { formatDuration, getDateRange, minutesToDecimalHours } from '@/lib/time/utils'
import { formatCurrency } from '@/lib/utils'

interface ReportData {
    summary: {
        totalMinutes: number
        billableMinutes: number
        billedMinutes: number
        nonBillableMinutes: number
        billableAmount: number
        entryCount: number
    }
    grouped: Record<string, { minutes: number; billableMinutes: number; count: number }>
    byClient: { name: string; minutes: number; billableMinutes: number }[]
    byProject: { name: string; minutes: number; billableMinutes: number }[]
}

export default function TimeReports() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<ReportData | null>(null)
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
    const [groupBy, setGroupBy] = useState<'day' | 'week' | 'client' | 'project'>('day')

    const { start, end } = getDateRange(period)

    useEffect(() => {
        fetchReport()
    }, [period, groupBy])

    const fetchReport = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
                groupBy,
            })

            const res = await fetch(`/api/time-entries/reports?${params}`)
            const reportData = await res.json()
            setData(reportData)
        } catch (err) {
            console.error('Failed to fetch report:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = () => {
        if (!data) return

        const csv = [
            ['Category', 'Total Time', 'Billable Time', 'Entries'].join(','),
            ...Object.entries(data.grouped).map(([key, value]) =>
                [key, formatDuration(value.minutes), formatDuration(value.billableMinutes), value.count].join(',')
            ),
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `time-report-${period}.csv`
        a.click()
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
            </div>
        )
    }

    if (!data) return null

    const billablePercentage = data.summary.totalMinutes > 0
        ? Math.round((data.summary.billableMinutes / data.summary.totalMinutes) * 100)
        : 0

    const maxMinutes = Math.max(...Object.values(data.grouped).map(g => g.minutes), 1)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        {(['week', 'month', 'year'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-sm rounded-md ${period === p ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>

                    <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as typeof groupBy)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900">
                        <option value="day">Group by Day</option>
                        <option value="week">Group by Week</option>
                        <option value="client">Group by Client</option>
                        <option value="project">Group by Project</option>
                    </select>
                </div>

                <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    <Download className="w-4 h-4" />Export CSV
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-500">Total Time</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(data.summary.totalMinutes)}</p>
                    <p className="text-xs text-gray-400 mt-1">{minutesToDecimalHours(data.summary.totalMinutes)} hours</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-500">Billable Time</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{formatDuration(data.summary.billableMinutes)}</p>
                    <p className="text-xs text-gray-400 mt-1">{billablePercentage}% of total</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        <span className="text-sm text-gray-500">Billable Amount</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(data.summary.billableAmount)}</p>
                    <p className="text-xs text-gray-400 mt-1">Based on hourly rates</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-5 h-5 text-orange-500" />
                        <span className="text-sm text-gray-500">Entries</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{data.summary.entryCount}</p>
                    <p className="text-xs text-gray-400 mt-1">Time entries logged</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Time Distribution</h3>
                <div className="space-y-3">
                    {Object.entries(data.grouped).slice(0, 15).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-4">
                            <div className="w-32 flex-shrink-0">
                                <p className="text-sm text-gray-600 truncate">{key}</p>
                            </div>
                            <div className="flex-1">
                                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full flex">
                                        <div className="bg-green-500 h-full" style={{ width: `${(value.billableMinutes / maxMinutes) * 100}%` }} />
                                        <div className="bg-gray-400 h-full" style={{ width: `${((value.minutes - value.billableMinutes) / maxMinutes) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="w-20 text-right">
                                <p className="text-sm font-medium text-gray-900">{formatDuration(value.minutes)}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded" /><span className="text-xs text-gray-500">Billable</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded" /><span className="text-xs text-gray-500">Non-billable</span></div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">By Client</h3>
                    {data.byClient.length === 0 ? (
                        <p className="text-gray-500 text-sm">No client data</p>
                    ) : (
                        <div className="space-y-3">
                            {data.byClient.sort((a, b) => b.minutes - a.minutes).slice(0, 10).map((client) => (
                                <div key={client.name} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{client.name}</span>
                                    <span className="text-sm font-medium text-gray-900">{formatDuration(client.minutes)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">By Project</h3>
                    {data.byProject.length === 0 ? (
                        <p className="text-gray-500 text-sm">No project data</p>
                    ) : (
                        <div className="space-y-3">
                            {data.byProject.sort((a, b) => b.minutes - a.minutes).slice(0, 10).map((project) => (
                                <div key={project.name} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{project.name}</span>
                                    <span className="text-sm font-medium text-gray-900">{formatDuration(project.minutes)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
