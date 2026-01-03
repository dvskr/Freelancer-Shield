"use client"

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Calendar, Award, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ChartData {
    month: string
    label: string
    collected: number
    invoiced: number
}

interface RevenueData {
    chartData: ChartData[]
    topClients: { name: string; revenue: number }[]
    summary: {
        totalCollected: number
        totalInvoiced: number
        collectionRate: number
        avgMonthlyRevenue: number
        bestMonth: string
        bestMonthRevenue: number
    }
}

export default function RevenueAnalytics() {
    const [data, setData] = useState<RevenueData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<'12months' | 'ytd' | 'all'>('12months')

    useEffect(() => {
        fetchData()
    }, [period])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/analytics/revenue?period=${period}`)
            const revenueData = await res.json()
            setData(revenueData)
        } catch (err) {
            console.error('Failed to fetch revenue data:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
        )
    }

    if (!data) return null

    const maxRevenue = Math.max(...data.chartData.map(d => Math.max(d.collected, d.invoiced)), 1)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                {(['12months', 'ytd', 'all'] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {p === '12months' ? 'Last 12 Months' : p === 'ytd' ? 'Year to Date' : 'All Time'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
                        <span className="text-sm text-gray-500">Total Collected</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalCollected)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
                        <span className="text-sm text-gray-500">Avg Monthly</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.avgMonthlyRevenue)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg"><Calendar className="w-5 h-5 text-purple-600" /></div>
                        <span className="text-sm text-gray-500">Collection Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{data.summary.collectionRate}%</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg"><Award className="w-5 h-5 text-orange-600" /></div>
                        <span className="text-sm text-gray-500">Best Month</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{data.summary.bestMonth}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(data.summary.bestMonthRevenue)}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-6">Revenue Over Time</h3>
                <div className="h-64 flex items-end gap-2">
                    {data.chartData.map((item) => (
                        <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex gap-0.5 items-end" style={{ height: '200px' }}>
                                <div className="flex-1 bg-green-500 rounded-t transition-all hover:bg-green-600" style={{ height: `${(item.collected / maxRevenue) * 100}%` }} title={`Collected: ${formatCurrency(item.collected)}`} />
                                {item.invoiced > item.collected && (
                                    <div className="flex-1 bg-blue-200 rounded-t" style={{ height: `${((item.invoiced - item.collected) / maxRevenue) * 100}%` }} title={`Pending: ${formatCurrency(item.invoiced - item.collected)}`} />
                                )}
                            </div>
                            <span className="text-xs text-gray-500 mt-2">{item.label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded" /><span className="text-sm text-gray-600">Collected</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-200 rounded" /><span className="text-sm text-gray-600">Pending</span></div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Top Clients by Revenue</h3>
                {data.topClients.length === 0 ? (
                    <p className="text-gray-500 text-sm">No client data yet</p>
                ) : (
                    <div className="space-y-3">
                        {data.topClients.map((client, index) => {
                            const percentage = (client.revenue / data.summary.totalCollected) * 100
                            return (
                                <div key={client.name} className="flex items-center gap-4">
                                    <span className="w-6 text-sm text-gray-400 text-right">{index + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-900">{client.name}</span>
                                            <span className="text-sm text-gray-600">{formatCurrency(client.revenue)}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
                                        </div>
                                    </div>
                                    <span className="w-12 text-xs text-gray-400 text-right">{percentage.toFixed(1)}%</span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
