"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, DollarSign, TrendingUp, Heart, Loader2, AlertCircle, CheckCircle, Clock, ArrowUpRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ClientMetrics {
    id: string
    name: string
    metrics: {
        totalRevenue: number
        outstandingAmount: number
        totalProjects: number
        activeProjects: number
        totalHours: number
        activityScore: number
        health: 'excellent' | 'good' | 'warning' | 'critical'
        lastActivity: string
    }
}

interface ClientData {
    clients: ClientMetrics[]
    summary: { totalClients: number; activeClients: number; totalRevenue: number; avgClientValue: number }
    healthBreakdown: { excellent: number; good: number; warning: number; critical: number }
}

export default function ClientInsights() {
    const [data, setData] = useState<ClientData | null>(null)
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState<'revenue' | 'activity' | 'recent'>('revenue')

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const res = await fetch('/api/analytics/clients')
            setData(await res.json())
        } catch (err) { console.error('Failed to fetch client data:', err) }
        finally { setLoading(false) }
    }

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'bg-green-100 text-green-700 border-green-200'
            case 'good': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'critical': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'excellent': return <CheckCircle className="w-4 h-4" />
            case 'good': return <TrendingUp className="w-4 h-4" />
            case 'warning': return <Clock className="w-4 h-4" />
            case 'critical': return <AlertCircle className="w-4 h-4" />
            default: return null
        }
    }

    if (loading) return <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center"><Loader2 className="w-8 h-8 text-gray-400 animate-spin" /></div>
    if (!data) return null

    const sortedClients = [...data.clients].sort((a, b) => {
        switch (sortBy) {
            case 'activity': return b.metrics.activityScore - a.metrics.activityScore
            case 'recent': return new Date(b.metrics.lastActivity).getTime() - new Date(a.metrics.lastActivity).getTime()
            default: return b.metrics.totalRevenue - a.metrics.totalRevenue
        }
    })

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div><span className="text-sm text-gray-500">Total Clients</span></div>
                    <p className="text-2xl font-bold text-gray-900">{data.summary.totalClients}</p>
                    <p className="text-xs text-gray-400 mt-1">{data.summary.activeClients} active</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div><span className="text-sm text-gray-500">Total Revenue</span></div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalRevenue)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-600" /></div><span className="text-sm text-gray-500">Avg Client Value</span></div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.avgClientValue)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-orange-100 rounded-lg"><Heart className="w-5 h-5 text-orange-600" /></div><span className="text-sm text-gray-500">Health Score</span></div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                            <div className="bg-green-500 h-full" style={{ width: `${(data.healthBreakdown.excellent / data.summary.totalClients) * 100}%` }} />
                            <div className="bg-blue-500 h-full" style={{ width: `${(data.healthBreakdown.good / data.summary.totalClients) * 100}%` }} />
                            <div className="bg-yellow-500 h-full" style={{ width: `${(data.healthBreakdown.warning / data.summary.totalClients) * 100}%` }} />
                            <div className="bg-red-500 h-full" style={{ width: `${(data.healthBreakdown.critical / data.summary.totalClients) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Client Analysis</h3>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="text-sm border border-gray-300 rounded-lg px-3 py-1 text-gray-900">
                        <option value="revenue">Revenue</option><option value="activity">Activity Score</option><option value="recent">Recent Activity</option>
                    </select>
                </div>
                {sortedClients.length === 0 ? <div className="p-8 text-center text-gray-500">No clients yet</div> : (
                    <div className="divide-y divide-gray-100">
                        {sortedClients.map((client, index) => (
                            <Link key={client.id} href={`/clients/${client.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                                <span className="w-8 text-sm text-gray-400 text-center">{index + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <p className="font-medium text-gray-900 truncate">{client.name}</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getHealthColor(client.metrics.health)}`}>
                                            {getHealthIcon(client.metrics.health)}{client.metrics.health}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <span>{client.metrics.totalProjects} projects</span>
                                        <span>{client.metrics.totalHours}h logged</span>
                                        <span>Last active: {formatDate(client.metrics.lastActivity)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{formatCurrency(client.metrics.totalRevenue)}</p>
                                    {client.metrics.outstandingAmount > 0 && <p className="text-xs text-orange-600">{formatCurrency(client.metrics.outstandingAmount)} outstanding</p>}
                                </div>
                                <div className="w-16 text-center"><div className="text-lg font-bold text-gray-900">{client.metrics.activityScore}</div><div className="text-xs text-gray-400">score</div></div>
                                <ArrowUpRight className="w-4 h-4 text-gray-400" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
