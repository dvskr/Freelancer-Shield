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
        const period = searchParams.get('period') || '12months'

        const now = new Date()
        let startDate: Date

        switch (period) {
            case 'ytd':
                startDate = new Date(now.getFullYear(), 0, 1)
                break
            case 'all':
                startDate = new Date(2020, 0, 1)
                break
            default:
                startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        }

        const payments = await prisma.payment.findMany({
            where: {
                invoice: { userId: profile.id },
                status: 'completed',
                createdAt: { gte: startDate },
            },
            select: {
                amount: true,
                createdAt: true,
                invoice: {
                    select: {
                        clientId: true,
                        client: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        })

        const invoices = await prisma.invoice.findMany({
            where: {
                userId: profile.id,
                createdAt: { gte: startDate },
                status: { not: 'cancelled' },
            },
            select: {
                total: true,
                createdAt: true,
                status: true,
            },
        })

        const monthlyRevenue: Record<string, { collected: number; invoiced: number }> = {}

        let currentDate = new Date(startDate)
        while (currentDate <= now) {
            const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
            monthlyRevenue[key] = { collected: 0, invoiced: 0 }
            currentDate.setMonth(currentDate.getMonth() + 1)
        }

        payments.forEach((payment) => {
            const date = new Date(payment.createdAt)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            if (monthlyRevenue[key]) {
                monthlyRevenue[key].collected += payment.amount
            }
        })

        invoices.forEach((invoice) => {
            const date = new Date(invoice.createdAt)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            if (monthlyRevenue[key]) {
                monthlyRevenue[key].invoiced += invoice.total
            }
        })

        const chartData = Object.entries(monthlyRevenue).map(([month, data]) => ({
            month,
            label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            collected: data.collected,
            invoiced: data.invoiced,
        }))

        const byClient = payments.reduce((acc, payment) => {
            const clientId = payment.invoice.clientId || 'unknown'
            const clientName = payment.invoice.client?.name || 'Unknown'
            if (!acc[clientId]) {
                acc[clientId] = { name: clientName, revenue: 0 }
            }
            acc[clientId].revenue += payment.amount
            return acc
        }, {} as Record<string, { name: string; revenue: number }>)

        const topClients = Object.values(byClient)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10)

        const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
        const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0)
        const collectionRate = totalInvoiced > 0
            ? Math.round((totalCollected / totalInvoiced) * 100)
            : 0

        const monthCount = Object.keys(monthlyRevenue).length || 1
        const avgMonthlyRevenue = Math.round(totalCollected / monthCount)

        const bestMonth = chartData.reduce((best, current) =>
            current.collected > best.collected ? current : best
            , chartData[0] || { label: '-', collected: 0 })

        return NextResponse.json({
            chartData,
            topClients,
            summary: {
                totalCollected,
                totalInvoiced,
                collectionRate,
                avgMonthlyRevenue,
                bestMonth: bestMonth.label,
                bestMonthRevenue: bestMonth.collected,
            },
        })
    } catch (error) {
        console.error('Revenue analytics error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
