"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, DollarSign, FolderKanban, CheckSquare, UserPlus, Loader2, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Activity {
    id: string; type: 'invoice' | 'payment' | 'project' | 'milestone' | 'client'; action: string; title: string; description: string; amount?: number; timestamp: string; link: string
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => { fetchActivities() }, [])
    const fetchActivities = async () => {
        try {
            const res = await fetch('/api/activity?limit=15')
            if (!res.ok) throw new Error('Failed to load activities')
            setActivities(await res.json())
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load activities')
        } finally {
            setLoading(false)
        }
    }

    const getIcon = (type: string) => { switch (type) { case 'invoice': return FileText; case 'payment': return DollarSign; case 'project': return FolderKanban; case 'milestone': return CheckSquare; case 'client': return UserPlus; default: return Clock } }
    const getIconColor = (type: string, action: string) => { if (type === 'payment' || action === 'paid' || action === 'approved') return 'bg-green-100 text-green-600'; if (action === 'pending') return 'bg-purple-100 text-purple-600'; switch (type) { case 'invoice': return 'bg-blue-100 text-blue-600'; case 'project': return 'bg-orange-100 text-orange-600'; case 'client': return 'bg-purple-100 text-purple-600'; default: return 'bg-gray-100 text-gray-600' } }
    const formatTime = (timestamp: string) => { const diff = Date.now() - new Date(timestamp).getTime(); const minutes = Math.floor(diff / 60000); const hours = Math.floor(minutes / 60); const days = Math.floor(hours / 24); if (minutes < 1) return 'Just now'; if (minutes < 60) return `${minutes}m ago`; if (hours < 24) return `${hours}h ago`; if (days < 7) return `${days}d ago`; return new Date(timestamp).toLocaleDateString() }

    if (loading) return <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
    if (error) return <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-red-500">{error}</div>

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200"><h3 className="font-semibold text-gray-900">Recent Activity</h3></div>
            {activities.length === 0 ? <div className="p-8 text-center text-gray-500">No recent activity</div> : (
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {activities.map((activity) => {
                        const Icon = getIcon(activity.type); return (
                            <Link key={activity.id} href={activity.link} className="flex items-start gap-3 p-4 hover:bg-gray-50">
                                <div className={`p-2 rounded-lg ${getIconColor(activity.type, activity.action)}`}><Icon className="w-4 h-4" /></div>
                                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900">{activity.title}</p><p className="text-xs text-gray-500">{activity.description}</p></div>
                                <div className="text-right flex-shrink-0">{activity.amount && <p className={`text-sm font-medium ${activity.type === 'payment' ? 'text-green-600' : 'text-gray-900'}`}>{activity.type === 'payment' ? '+' : ''}{formatCurrency(activity.amount)}</p>}<p className="text-xs text-gray-400">{formatTime(activity.timestamp)}</p></div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
