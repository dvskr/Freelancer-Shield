import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const now = new Date()
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay() + 1); startOfWeek.setHours(0, 0, 0, 0)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const timeEntries = await prisma.timeEntry.findMany({
            where: { userId: profile.id, isRunning: false },
            select: { duration: true, billable: true, billed: true, date: true, hourlyRate: true, client: { select: { name: true } }, project: { select: { name: true } } },
        })

        const thisWeekEntries = timeEntries.filter(e => new Date(e.date) >= startOfWeek)
        const thisWeekTotal = thisWeekEntries.reduce((sum, e) => sum + e.duration, 0)
        const thisWeekBillable = thisWeekEntries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0)

        const thisMonthEntries = timeEntries.filter(e => new Date(e.date) >= startOfMonth)
        const thisMonthTotal = thisMonthEntries.reduce((sum, e) => sum + e.duration, 0)
        const thisMonthBillable = thisMonthEntries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0)
        const thisMonthBilled = thisMonthEntries.filter(e => e.billed).reduce((sum, e) => sum + e.duration, 0)

        const workingDaysThisMonth = Math.ceil((now.getDate()) * 5 / 7)
        const targetHoursMonth = workingDaysThisMonth * 8 * 60
        const utilizationRate = targetHoursMonth > 0 ? Math.round((thisMonthBillable / targetHoursMonth) * 100) : 0

        const dailyData: { date: string; day: string; billable: number; nonBillable: number }[] = []
        for (let i = 13; i >= 0; i--) {
            const date = new Date(now); date.setDate(date.getDate() - i); date.setHours(0, 0, 0, 0)
            const dateStr = date.toISOString().split('T')[0]
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            const dayEntries = timeEntries.filter(e => new Date(e.date).toISOString().split('T')[0] === dateStr)
            dailyData.push({ date: dateStr, day: dayName, billable: dayEntries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0), nonBillable: dayEntries.filter(e => !e.billable).reduce((sum, e) => sum + e.duration, 0) })
        }

        const byClient = timeEntries.reduce((acc, entry) => {
            const name = entry.client?.name || 'No Client'
            if (!acc[name]) acc[name] = { billable: 0, nonBillable: 0 }
            if (entry.billable) acc[name].billable += entry.duration
            else acc[name].nonBillable += entry.duration
            return acc
        }, {} as Record<string, { billable: number; nonBillable: number }>)

        const clientBreakdown = Object.entries(byClient).map(([name, data]) => ({ name, billable: data.billable, nonBillable: data.nonBillable, total: data.billable + data.nonBillable })).sort((a, b) => b.total - a.total).slice(0, 10)

        const billableValue = timeEntries.filter(e => e.billable && e.hourlyRate).reduce((sum, e) => sum + (e.duration / 60) * (e.hourlyRate || 0), 0)

        return NextResponse.json({
            summary: { thisWeekTotal: Math.round(thisWeekTotal / 60 * 10) / 10, thisWeekBillable: Math.round(thisWeekBillable / 60 * 10) / 10, thisMonthTotal: Math.round(thisMonthTotal / 60 * 10) / 10, thisMonthBillable: Math.round(thisMonthBillable / 60 * 10) / 10, thisMonthBilled: Math.round(thisMonthBilled / 60 * 10) / 10, utilizationRate, billableRate: thisMonthTotal > 0 ? Math.round((thisMonthBillable / thisMonthTotal) * 100) : 0, billableValue: Math.round(billableValue) },
            dailyData, clientBreakdown,
        })
    } catch (error) {
        console.error('Time analytics error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
