"use client"

import { useState, useEffect } from 'react'
import {
    DollarSign,
    FileText,
    FolderKanban,
    Clock,
    Loader2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import KPICard from './KPICard'
import AlertsCard from './AlertsCard'
import RecentActivity from './RecentActivity'
import QuickActions from './QuickActions'

interface DashboardContentProps {
    initialData: {
        revenueThisMonth: number
        outstanding: number
        activeProjects: number
        totalClients: number
    }
}

export default function DashboardContent({ initialData }: DashboardContentProps) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/dashboard')
            const dashboardData = await res.json()
            setData(dashboardData)
        } catch (err) {
            console.error('Failed to fetch dashboard:', err)
        } finally {
            setLoading(false)
        }
    }

    const kpis = data?.kpis || {
        revenueThisMonth: initialData.revenueThisMonth,
        revenueChange: 0,
        outstanding: initialData.outstanding,
        outstandingCount: 0,
        activeProjects: initialData.activeProjects,
        totalClients: initialData.totalClients,
        billableHoursThisMonth: 0,
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Revenue This Month"
                    value={formatCurrency(kpis.revenueThisMonth)}
                    change={kpis.revenueChange}
                    icon={DollarSign}
                    color="green"
                />
                <KPICard
                    title="Outstanding"
                    value={formatCurrency(kpis.outstanding)}
                    subtitle={`${kpis.outstandingCount} invoices`}
                    icon={FileText}
                    color="orange"
                />
                <KPICard
                    title="Active Projects"
                    value={kpis.activeProjects}
                    icon={FolderKanban}
                    color="blue"
                />
                <KPICard
                    title="Billable Hours"
                    value={`${kpis.billableHoursThisMonth}h`}
                    subtitle="This month"
                    icon={Clock}
                    color="purple"
                />
            </div>

            {/* Alerts */}
            {data?.alerts && (
                <AlertsCard alerts={data.alerts} />
            )}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <QuickActions />
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                    ) : (
                        <RecentActivity
                            invoices={data?.recent?.invoices || []}
                            payments={data?.recent?.payments || []}
                            projects={data?.recent?.projects || []}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
