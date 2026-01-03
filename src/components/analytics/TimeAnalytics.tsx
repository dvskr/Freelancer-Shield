"use client"

import { useState, useEffect } from 'react'
import { Clock, TrendingUp, DollarSign, Target, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TimeData {
    summary: { thisWeekTotal: number; thisWeekBillable: number; thisMonthTotal: number; thisMonthBillable: number; thisMonthBilled: number; utilizationRate: number; billableRate: number; billableValue: number }
    dailyData: { date: string; day: string; billable: number; nonBillable: number }[]
    clientBreakdown: { name: string; billable: number; nonBillable: number; total: number }[]
}

export default function TimeAnalytics() {
    const [data, setData] = useState<TimeData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])
    const fetchData = async () => { try { setData(await (await fetch('/api/analytics/time')).json()) } catch (e) { } finally { setLoading(false) } }

    const formatHours = (minutes: number) => { const hours = Math.floor(minutes / 60); const mins = minutes % 60; return hours > 0 ? `${hours}h ${mins}m` : `${mins}m` }

    if (loading) return <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center"><Loader2 className="w-8 h-8 text-gray-400 animate-spin" /></div>
    if (!data) return null

    const maxDailyMinutes = Math.max(...data.dailyData.map(d => d.billable + d.nonBillable), 60)

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-100 rounded-lg"><Clock className="w-5 h-5 text-blue-600" /></div><span className="text-sm text-gray-500">This Week</span></div><p className="text-2xl font-bold text-gray-900">{data.summary.thisWeekTotal}h</p><p className="text-xs text-gray-400 mt-1">{data.summary.thisWeekBillable}h billable</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div><span className="text-sm text-gray-500">Billable Rate</span></div><p className="text-2xl font-bold text-gray-900">{data.summary.billableRate}%</p><p className="text-xs text-gray-400 mt-1">of total time</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-purple-100 rounded-lg"><Target className="w-5 h-5 text-purple-600" /></div><span className="text-sm text-gray-500">Utilization</span></div><p className="text-2xl font-bold text-gray-900">{data.summary.utilizationRate}%</p><p className="text-xs text-gray-400 mt-1">vs 8h/day target</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-orange-100 rounded-lg"><DollarSign className="w-5 h-5 text-orange-600" /></div><span className="text-sm text-gray-500">Billable Value</span></div><p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.billableValue)}</p><p className="text-xs text-gray-400 mt-1">this month</p></div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Last 14 Days</h3>
                <div className="h-48 flex items-end gap-1">
                    {data.dailyData.map((item) => (
                        <div key={item.date} className="flex-1 flex flex-col items-center">
                            <div className="w-full flex flex-col items-end" style={{ height: '160px' }}>
                                {item.nonBillable > 0 && <div className="w-full bg-gray-300 rounded-t" style={{ height: `${(item.nonBillable / maxDailyMinutes) * 100}%` }} title={`Non-billable: ${formatHours(item.nonBillable)}`} />}
                                {item.billable > 0 && <div className="w-full bg-green-500 rounded-t" style={{ height: `${(item.billable / maxDailyMinutes) * 100}%` }} title={`Billable: ${formatHours(item.billable)}`} />}
                            </div>
                            <span className="text-xs text-gray-400 mt-2">{item.day}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded" /><span className="text-sm text-gray-600">Billable</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-300 rounded" /><span className="text-sm text-gray-600">Non-billable</span></div></div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Time by Client</h3>
                {data.clientBreakdown.length === 0 ? <p className="text-gray-500 text-sm">No time tracked yet</p> : (
                    <div className="space-y-3">
                        {data.clientBreakdown.map((client) => {
                            const billablePercent = client.total > 0 ? (client.billable / client.total) * 100 : 0
                            return (
                                <div key={client.name}><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-gray-900">{client.name}</span><span className="text-sm text-gray-600">{formatHours(client.total)}</span></div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex"><div className="bg-green-500 h-full" style={{ width: `${billablePercent}%` }} /><div className="bg-gray-300 h-full" style={{ width: `${100 - billablePercent}%` }} /></div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
