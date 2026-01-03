import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TimeToInvoice from '@/components/time/TimeToInvoice'

export const metadata = {
    title: 'Create Invoice from Time | FreelancerShield',
}

export default async function TimeToInvoicePage() {
    const { profile } = await requireAuth()

    const [entries, clients] = await Promise.all([
        prisma.timeEntry.findMany({
            where: {
                userId: profile.id,
                billed: false,
                isRunning: false,
                billable: true,
                hourlyRate: { not: null },
            },
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        }),
        prisma.client.findMany({
            where: { userId: profile.id },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
    ])

    return (
        <div className="space-y-6">
            <div>
                <Link href="/time" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft className="w-4 h-4" />Back to Time Tracking
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Invoice from Time</h1>
                <p className="text-gray-600 mt-1">Select time entries to create an invoice</p>
            </div>

            <TimeToInvoice entries={entries} clients={clients} />
        </div>
    )
}
