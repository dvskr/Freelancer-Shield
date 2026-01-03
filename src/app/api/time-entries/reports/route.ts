import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const groupBy = searchParams.get('groupBy') || 'day'

        const where: Record<string, unknown> = {
            userId: profile.id,
            isRunning: false,
        }

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate + 'T23:59:59'),
            }
        }

        const entries = await prisma.timeEntry.findMany({
            where,
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
            orderBy: { date: 'asc' },
        })

        const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0)
        const billableMinutes = entries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0)
        const billedMinutes = entries.filter(e => e.billed).reduce((sum, e) => sum + e.duration, 0)

        const billableAmount = entries
            .filter(e => e.billable && e.hourlyRate)
            .reduce((sum, e) => sum + (e.duration / 60) * (e.hourlyRate || 0), 0)

        const grouped: Record<string, { minutes: number; billableMinutes: number; count: number }> = {}

        entries.forEach((entry) => {
            let key: string

            switch (groupBy) {
                case 'client':
                    key = entry.client?.name || 'No Client'
                    break
                case 'project':
                    key = entry.project?.name || 'No Project'
                    break
                case 'week':
                    const weekDate = new Date(entry.date)
                    const day = weekDate.getDay()
                    weekDate.setDate(weekDate.getDate() - day + (day === 0 ? -6 : 1))
                    key = weekDate.toISOString().split('T')[0]
                    break
                case 'month':
                    const monthDate = new Date(entry.date)
                    key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
                    break
                default:
                    key = new Date(entry.date).toISOString().split('T')[0]
            }

            if (!grouped[key]) {
                grouped[key] = { minutes: 0, billableMinutes: 0, count: 0 }
            }
            grouped[key].minutes += entry.duration
            grouped[key].billableMinutes += entry.billable ? entry.duration : 0
            grouped[key].count += 1
        })

        const byClient = entries.reduce((acc, entry) => {
            const key = entry.client?.id || 'no-client'
            const name = entry.client?.name || 'No Client'
            if (!acc[key]) {
                acc[key] = { name, minutes: 0, billableMinutes: 0 }
            }
            acc[key].minutes += entry.duration
            acc[key].billableMinutes += entry.billable ? entry.duration : 0
            return acc
        }, {} as Record<string, { name: string; minutes: number; billableMinutes: number }>)

        const byProject = entries.reduce((acc, entry) => {
            const key = entry.project?.id || 'no-project'
            const name = entry.project?.name || 'No Project'
            if (!acc[key]) {
                acc[key] = { name, minutes: 0, billableMinutes: 0 }
            }
            acc[key].minutes += entry.duration
            acc[key].billableMinutes += entry.billable ? entry.duration : 0
            return acc
        }, {} as Record<string, { name: string; minutes: number; billableMinutes: number }>)

        return NextResponse.json({
            summary: {
                totalMinutes,
                billableMinutes,
                billedMinutes,
                nonBillableMinutes: totalMinutes - billableMinutes,
                billableAmount: Math.round(billableAmount),
                entryCount: entries.length,
            },
            grouped,
            byClient: Object.values(byClient),
            byProject: Object.values(byProject),
        })
    } catch (error) {
        console.error('Reports GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
