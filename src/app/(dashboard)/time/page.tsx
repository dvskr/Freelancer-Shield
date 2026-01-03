import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import TimerWidget from '@/components/time/TimerWidget'
import TimeEntryList from '@/components/time/TimeEntryList'
import TimeFilters from '@/components/time/TimeFilters'
import { formatDuration } from '@/lib/time/utils'

interface TimePageProps {
    searchParams: Promise<{
        startDate?: string
        endDate?: string
        clientId?: string
        projectId?: string
        billable?: string
    }>
}

export const metadata = {
    title: 'Time Tracking | FreelancerShield',
}

export default async function TimePage({ searchParams }: TimePageProps) {
    const { profile } = await requireAuth()
    const params = await searchParams

    // Default to current week
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(now)
    weekStart.setDate(diff)
    weekStart.setHours(0, 0, 0, 0)

    const startDate = params.startDate || weekStart.toISOString().split('T')[0]
    const endDate = params.endDate || new Date().toISOString().split('T')[0]

    const where: Record<string, unknown> = {
        userId: profile.id,
        date: {
            gte: new Date(startDate),
            lte: new Date(endDate + 'T23:59:59'),
        },
    }

    if (params.clientId) where.clientId = params.clientId
    if (params.projectId) where.projectId = params.projectId
    if (params.billable !== undefined) {
        where.billable = params.billable === 'true'
    }

    const [timeEntries, runningTimer, clients, projects, stats] = await Promise.all([
        prisma.timeEntry.findMany({
            where: { ...where, isRunning: false },
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
                milestone: { select: { id: true, name: true } },
            },
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        }),
        prisma.timeEntry.findFirst({
            where: { userId: profile.id, isRunning: true },
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
        }),
        prisma.client.findMany({
            where: { userId: profile.id },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
        prisma.project.findMany({
            where: { userId: profile.id },
            select: { id: true, name: true, clientId: true },
            orderBy: { name: 'asc' },
        }),
        prisma.timeEntry.aggregate({
            where: { ...where, isRunning: false },
            _sum: { duration: true },
            _count: true,
        }),
    ])

    const totalMinutes = stats._sum.duration || 0
    const billableEntries = timeEntries.filter(e => e.billable)
    const billableMinutes = billableEntries.reduce((sum, e) => sum + e.duration, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
                    <p className="text-gray-600 mt-1">Track and manage your work hours</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/time/timesheet" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Timesheet
                    </Link>
                    <Link href="/time/reports" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Reports
                    </Link>
                    <Link href="/time/invoice" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Invoice Time
                    </Link>
                    <Link href="/time/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-5 h-5" />Log Time
                    </Link>
                </div>
            </div>

            <TimerWidget
                clients={clients}
                projects={projects}
                initialTimer={runningTimer ? {
                    id: runningTimer.id,
                    description: runningTimer.description,
                    timerStartedAt: runningTimer.timerStartedAt?.toISOString() || runningTimer.createdAt.toISOString(),
                    client: runningTimer.client,
                    project: runningTimer.project,
                } : null}
            />

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Time</p>
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(totalMinutes)}</p>
                    <p className="text-xs text-gray-400">{stats._count} entries</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Billable</p>
                    <p className="text-2xl font-bold text-green-600">{formatDuration(billableMinutes)}</p>
                    <p className="text-xs text-gray-400">{billableEntries.length} entries</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Non-Billable</p>
                    <p className="text-2xl font-bold text-gray-600">{formatDuration(totalMinutes - billableMinutes)}</p>
                    <p className="text-xs text-gray-400">{timeEntries.length - billableEntries.length} entries</p>
                </div>
            </div>

            <TimeFilters
                clients={clients}
                projects={projects}
                currentFilters={{
                    startDate,
                    endDate,
                    clientId: params.clientId,
                    projectId: params.projectId,
                    billable: params.billable,
                }}
            />

            <TimeEntryList entries={timeEntries} />
        </div>
    )
}
