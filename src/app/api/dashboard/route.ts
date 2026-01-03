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

        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        const startOfYear = new Date(now.getFullYear(), 0, 1)

        const [
            revenueThisMonth,
            revenueLastMonth,
            revenueYTD,
            outstandingInvoices,
            activeProjects,
            totalClients,
            newClientsThisMonth,
            timeThisMonth,
            pendingInvoices,
            overdueInvoices,
            pendingMilestones,
            recentInvoices,
            recentPayments,
            recentProjects,
        ] = await Promise.all([
            prisma.payment.aggregate({
                where: {
                    invoice: { userId: profile.id },
                    status: 'completed',
                    createdAt: { gte: startOfMonth },
                },
                _sum: { amount: true },
            }),
            prisma.payment.aggregate({
                where: {
                    invoice: { userId: profile.id },
                    status: 'completed',
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
                _sum: { amount: true },
            }),
            prisma.payment.aggregate({
                where: {
                    invoice: { userId: profile.id },
                    status: 'completed',
                    createdAt: { gte: startOfYear },
                },
                _sum: { amount: true },
            }),
            prisma.invoice.aggregate({
                where: {
                    userId: profile.id,
                    status: { in: ['sent', 'overdue'] },
                },
                _sum: { total: true },
                _count: true,
            }),
            prisma.project.count({
                where: { userId: profile.id, status: 'active' },
            }),
            prisma.client.count({
                where: { userId: profile.id },
            }),
            prisma.client.count({
                where: {
                    userId: profile.id,
                    createdAt: { gte: startOfMonth },
                },
            }),
            prisma.timeEntry.aggregate({
                where: {
                    userId: profile.id,
                    billable: true,
                    date: { gte: startOfMonth },
                    isRunning: false,
                },
                _sum: { duration: true },
            }),
            prisma.invoice.count({
                where: { userId: profile.id, status: 'draft' },
            }),
            prisma.invoice.count({
                where: { userId: profile.id, status: 'overdue' },
            }),
            prisma.milestone.count({
                where: {
                    project: { userId: profile.id },
                    status: 'pending_approval',
                },
            }),
            prisma.invoice.findMany({
                where: { userId: profile.id },
                select: {
                    id: true,
                    invoiceNumber: true,
                    status: true,
                    total: true,
                    createdAt: true,
                    client: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            prisma.payment.findMany({
                where: { invoice: { userId: profile.id }, status: 'completed' },
                select: {
                    id: true,
                    amount: true,
                    createdAt: true,
                    invoice: {
                        select: {
                            invoiceNumber: true,
                            client: { select: { name: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            prisma.project.findMany({
                where: { userId: profile.id },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    createdAt: true,
                    client: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ])

        const revenueThisMonthValue = revenueThisMonth._sum.amount || 0
        const revenueLastMonthValue = revenueLastMonth._sum.amount || 0
        const revenueChange = revenueLastMonthValue > 0
            ? Math.round(((revenueThisMonthValue - revenueLastMonthValue) / revenueLastMonthValue) * 100)
            : 0

        const billableHoursThisMonth = Math.round((timeThisMonth._sum.duration || 0) / 60 * 10) / 10

        return NextResponse.json({
            kpis: {
                revenueThisMonth: revenueThisMonthValue,
                revenueLastMonth: revenueLastMonthValue,
                revenueChange,
                revenueYTD: revenueYTD._sum.amount || 0,
                outstanding: outstandingInvoices._sum.total || 0,
                outstandingCount: outstandingInvoices._count || 0,
                activeProjects,
                totalClients,
                newClientsThisMonth,
                billableHoursThisMonth,
            },
            alerts: {
                pendingInvoices,
                overdueInvoices,
                pendingMilestones,
            },
            recent: {
                invoices: recentInvoices,
                payments: recentPayments,
                projects: recentProjects,
            },
        })
    } catch (error) {
        console.error('Dashboard GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
