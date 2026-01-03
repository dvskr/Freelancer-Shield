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

        // Get reminder stats for last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const reminders = await prisma.reminderSchedule.findMany({
            where: {
                userId: profile.id,
                createdAt: { gte: thirtyDaysAgo },
            },
            include: {
                invoice: {
                    select: {
                        status: true,
                        paidAt: true,
                    },
                },
            },
        })

        // Calculate stats
        const stats = {
            total: reminders.length,
            sent: reminders.filter(r => r.status === 'sent').length,
            failed: reminders.filter(r => r.status === 'failed').length,
            pending: reminders.filter(r => r.status === 'scheduled').length,
            cancelled: reminders.filter(r => r.status === 'cancelled').length,
        }

        // Calculate effectiveness (reminders that led to payment)
        const sentReminders = reminders.filter(r => r.status === 'sent')
        const paidAfterReminder = sentReminders.filter(r => {
            if (!r.invoice.paidAt) return false
            const paidAt = new Date(r.invoice.paidAt)
            const sentAt = new Date(r.sentAt!)
            // Paid within 7 days of reminder
            return paidAt > sentAt && (paidAt.getTime() - sentAt.getTime()) < 7 * 24 * 60 * 60 * 1000
        })

        const effectiveness = sentReminders.length > 0
            ? Math.round((paidAfterReminder.length / sentReminders.length) * 100)
            : 0

        // Breakdown by type
        const byType = reminders.reduce((acc, r) => {
            acc[r.reminderType] = (acc[r.reminderType] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return NextResponse.json({
            stats,
            effectiveness,
            byType,
            period: '30 days',
        })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
