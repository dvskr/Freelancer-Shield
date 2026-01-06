"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FolderKanban, TrendingUp, Clock, DollarSign, Loader2, AlertTriangle, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ProjectMetrics {
    id: string; name: string; status: string; client: string
    metrics: { progress: number; totalMilestones: number; completedMilestones: number; overdueMilestones: number; totalBudget: number; earnedBudget: number; totalHours: number; healthScore: number; health: 'on_track' | 'at_risk' | 'behind' | 'critical' }
}

interface ProjectData {
    projects: ProjectMetrics[]
    summary: { total: number; active: number; completed: number; avgProgress: number; totalBudget: number; totalEarned: number }
    healthCounts: { on_track: number; at_risk: number; behind: number; critical: number }
}

export default function ProjectHealth() {
    const [data, setData] = useState<ProjectData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'active' | 'at_risk'>('active')

    useEffect(() => { fetchData() }, [])
    const fetchData = async () => {
        try {
            const res = await fetch('/api/analytics/projects')
            if (!res.ok) throw new Error('Failed to load projects')
            setData(await res.json())
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const getHealthColor = (health: string) => {
        switch (health) { case 'on_track': return 'bg-green-100 text-green-700'; case 'at_risk': return 'bg-yellow-100 text-yellow-700'; case 'behind': return 'bg-orange-100 text-orange-700'; case 'critical': return 'bg-red-100 text-red-700'; default: return 'bg-gray-100 text-gray-700' }
    }
    const getHealthIcon = (health: string) => {
        switch (health) { case 'on_track': return <CheckCircle className="w-4 h-4" />; case 'at_risk': return <AlertTriangle className="w-4 h-4" />; case 'behind': return <Clock className="w-4 h-4" />; case 'critical': return <AlertCircle className="w-4 h-4" />; default: return null }
    }

    if (loading) return <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center"><Loader2 className="w-8 h-8 text-gray-400 animate-spin" /></div>
    if (error) return <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-red-500">{error}</div>
    if (!data) return null

    const filteredProjects = data.projects.filter(p => {
        if (filter === 'active') return p.status === 'active'
        if (filter === 'at_risk') return p.metrics.health !== 'on_track' && p.status === 'active'
        return true
    })

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-100 rounded-lg"><FolderKanban className="w-5 h-5 text-blue-600" /></div><span className="text-sm text-gray-500">Active Projects</span></div><p className="text-2xl font-bold text-gray-900">{data.summary.active}</p><p className="text-xs text-gray-400 mt-1">{data.summary.completed} completed</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div><span className="text-sm text-gray-500">Avg Progress</span></div><p className="text-2xl font-bold text-gray-900">{data.summary.avgProgress}%</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-purple-100 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div><span className="text-sm text-gray-500">Total Budget</span></div><p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalBudget)}</p><p className="text-xs text-gray-400 mt-1">{formatCurrency(data.summary.totalEarned)} earned</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-orange-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div><span className="text-sm text-gray-500">Needs Attention</span></div><p className="text-2xl font-bold text-gray-900">{data.healthCounts.at_risk + data.healthCounts.behind + data.healthCounts.critical}</p></div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3"><span className="text-sm font-medium text-gray-700">Project Health Overview</span>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full" /> On Track ({data.healthCounts.on_track})</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-full" /> At Risk ({data.healthCounts.at_risk})</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full" /> Behind ({data.healthCounts.behind})</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full" /> Critical ({data.healthCounts.critical})</span>
                    </div>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="bg-green-500 h-full" style={{ width: `${(data.healthCounts.on_track / data.summary.total) * 100}%` }} />
                    <div className="bg-yellow-500 h-full" style={{ width: `${(data.healthCounts.at_risk / data.summary.total) * 100}%` }} />
                    <div className="bg-orange-500 h-full" style={{ width: `${(data.healthCounts.behind / data.summary.total) * 100}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${(data.healthCounts.critical / data.summary.total) * 100}%` }} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {(['all', 'active', 'at_risk'] as const).map((f) => (<button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f === 'all' ? 'All Projects' : f === 'active' ? 'Active' : 'Needs Attention'}</button>))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {filteredProjects.length === 0 ? <div className="p-8 text-center text-gray-500">No projects match filter</div> : (
                    <div className="divide-y divide-gray-100">
                        {filteredProjects.map((project) => (
                            <Link key={project.id} href={`/projects/${project.id}`} className="block p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3"><h4 className="font-medium text-gray-900">{project.name}</h4><span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getHealthColor(project.metrics.health)}`}>{getHealthIcon(project.metrics.health)}{project.metrics.health.replace('_', ' ')}</span></div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                                    <span>{project.client}</span><span>{project.metrics.completedMilestones}/{project.metrics.totalMilestones} milestones</span><span>{project.metrics.totalHours}h logged</span>
                                    {project.metrics.overdueMilestones > 0 && <span className="text-red-600">{project.metrics.overdueMilestones} overdue</span>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1"><div className="flex items-center justify-between text-xs mb-1"><span className="text-gray-500">Progress</span><span className="font-medium">{project.metrics.progress}%</span></div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${project.metrics.health === 'on_track' ? 'bg-green-500' : project.metrics.health === 'at_risk' ? 'bg-yellow-500' : project.metrics.health === 'behind' ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${project.metrics.progress}%` }} /></div>
                                    </div>
                                    <div className="text-right"><p className="text-sm font-medium text-gray-900">{formatCurrency(project.metrics.earnedBudget)}</p><p className="text-xs text-gray-400">of {formatCurrency(project.metrics.totalBudget)}</p></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
