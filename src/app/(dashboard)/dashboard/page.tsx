import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import DashboardContent from '@/components/dashboard/DashboardContent'

export const metadata = {
    title: 'Dashboard | FreelancerShield',
}

export default async function DashboardPage() {
    const { profile } = await requireAuth()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
        revenueThisMonth,
        outstandingTotal,
        activeProjects,
        totalClients,
    ] = await Promise.all([
        prisma.payment.aggregate({
            where: {
                invoice: { userId: profile.id },
                status: 'completed',
                createdAt: { gte: startOfMonth },
            },
            _sum: { amount: true },
        }),
        prisma.invoice.aggregate({
            where: {
                userId: profile.id,
                status: { in: ['sent', 'overdue'] },
            },
            _sum: { total: true },
        }),
        prisma.project.count({
            where: { userId: profile.id, status: 'active' },
        }),
        prisma.client.count({
            where: { userId: profile.id },
        }),
    ])

    const initialData = {
        revenueThisMonth: revenueThisMonth._sum.amount || 0,
        outstanding: outstandingTotal._sum.total || 0,
        activeProjects,
        totalClients,
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Welcome back, {profile.firstName}! Here's your business overview.
                </p>
            </div>

            <DashboardContent initialData={initialData} />
        </div>
    )
}
