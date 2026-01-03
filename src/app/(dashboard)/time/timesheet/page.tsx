import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import WeeklyTimesheet from '@/components/time/WeeklyTimesheet'

export const metadata = {
    title: 'Weekly Timesheet | FreelancerShield',
}

export default async function WeeklyTimesheetPage() {
    const { profile } = await requireAuth()

    // Get entries for last 3 months for timesheet navigation
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const entries = await prisma.timeEntry.findMany({
        where: {
            userId: profile.id,
            isRunning: false,
            date: { gte: threeMonthsAgo },
        },
        select: {
            id: true,
            description: true,
            date: true,
            duration: true,
            project: { select: { id: true, name: true } },
        },
        orderBy: { date: 'desc' },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/time" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4" />Back to Time Tracking
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Weekly Timesheet</h1>
                    <p className="text-gray-600 mt-1">View and manage your weekly time entries</p>
                </div>
            </div>

            <WeeklyTimesheet entries={entries} />
        </div>
    )
}
