import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TimeEntryForm from '@/components/time/TimeEntryForm'

export const metadata = {
    title: 'New Time Entry | FreelancerShield',
}

export default async function NewTimeEntryPage() {
    const { profile } = await requireAuth()

    const [clients, projects, milestones] = await Promise.all([
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
        prisma.milestone.findMany({
            where: { project: { userId: profile.id } },
            select: { id: true, name: true, projectId: true },
            orderBy: { orderIndex: 'asc' },
        }),
    ])

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/time"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Time Tracking
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Log Time</h1>
                <p className="text-gray-600 mt-1">Record time spent on your work</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <TimeEntryForm
                    clients={clients}
                    projects={projects}
                    milestones={milestones}
                />
            </div>
        </div>
    )
}
