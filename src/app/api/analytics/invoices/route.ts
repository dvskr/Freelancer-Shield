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

        const invoices = await prisma.invoice.findMany({
            where: { userId: profile.id },
            select: { id: true, total: true, amountPaid: true, status: true, createdAt: true, dueDate: true, paidAt: true },
        })

        const statusCounts: Record<string, number> = { draft: 0, sent: 0, paid: 0, overdue: 0, cancelled: 0 }
        const statusAmounts: Record<string, number> = { draft: 0, sent: 0, paid: 0, overdue: 0, cancelled: 0 }

        invoices.forEach((inv) => {
            const status = inv.status as keyof typeof statusCounts
            statusCounts[status]++
            statusAmounts[status] += inv.total
        })

        const paidInvoices = invoices.filter(i => i.status === 'paid' && i.paidAt)
        const daysToPayment = paidInvoices.map(inv => Math.ceil((new Date(inv.paidAt!).getTime() - new Date(inv.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
        const avgDaysToPayment = daysToPayment.length > 0 ? Math.round(daysToPayment.reduce((a, b) => a + b, 0) / daysToPayment.length) : 0

        const overdueInvoices = invoices.filter(i => i.status === 'overdue')
        const totalOverdue = overdueInvoices.reduce((sum, i) => sum + (i.total - i.amountPaid), 0)
        const avgDaysOverdue = overdueInvoices.length > 0 ? Math.round(overdueInvoices.reduce((sum, inv) => sum + Math.ceil((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)), 0) / overdueInvoices.length) : 0

        const monthlyData: { month: string; count: number; amount: number; paid: number }[] = []
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
            const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short' })
            const monthInvoices = invoices.filter(inv => { const created = new Date(inv.createdAt); return created >= monthStart && created <= monthEnd })
            monthlyData.push({ month: monthLabel, count: monthInvoices.length, amount: monthInvoices.reduce((sum, i) => sum + i.total, 0), paid: monthInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0) })
        }

        const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0)
        const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0)
        const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0

        return NextResponse.json({ statusCounts, statusAmounts, monthlyData, summary: { totalInvoices: invoices.length, totalInvoiced, totalCollected, collectionRate, avgDaysToPayment, totalOverdue, overdueCount: overdueInvoices.length, avgDaysOverdue } })
    } catch (error) {
        console.error('Invoice analytics error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
