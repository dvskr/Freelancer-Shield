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
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

        const clients = await prisma.client.findMany({
            where: { userId: profile.id },
            include: {
                projects: { select: { id: true, status: true, createdAt: true } },
                invoices: { select: { id: true, total: true, amountPaid: true, status: true, createdAt: true, dueDate: true } },
                timeEntries: { select: { duration: true, date: true } },
            },
        })

        const clientMetrics = clients.map((client) => {
            const totalRevenue = client.invoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
            const outstandingAmount = client.invoices
                .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
                .reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0)
            const totalProjects = client.projects.length
            const activeProjects = client.projects.filter(p => p.status === 'active').length
            const totalHours = Math.round(client.timeEntries.reduce((sum, t) => sum + t.duration, 0) / 60)
            const recentHours = Math.round(client.timeEntries.filter(t => new Date(t.date) >= thirtyDaysAgo).reduce((sum, t) => sum + t.duration, 0) / 60)

            let activityScore = 0
            if (activeProjects > 0) activityScore += 30
            if (recentHours > 0) activityScore += 30
            const recentInvoices = client.invoices.filter(i => new Date(i.createdAt) >= ninetyDaysAgo)
            if (recentInvoices.length > 0) activityScore += 20
            const overdueInvoices = client.invoices.filter(i => i.status === 'overdue')
            if (overdueInvoices.length === 0) activityScore += 20

            let health: 'excellent' | 'good' | 'warning' | 'critical' = 'good'
            if (activityScore >= 80) health = 'excellent'
            else if (activityScore >= 50) health = 'good'
            else if (activityScore >= 30) health = 'warning'
            else health = 'critical'

            const lastInvoice = client.invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            const lastProject = client.projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            const lastActivity = lastInvoice?.createdAt || lastProject?.createdAt || client.createdAt

            return {
                id: client.id,
                name: client.name,
                company: client.company,
                email: client.email,
                createdAt: client.createdAt,
                metrics: { totalRevenue, outstandingAmount, totalProjects, activeProjects, totalHours, recentHours, activityScore, health, lastActivity },
            }
        })

        const sortedClients = clientMetrics.sort((a, b) => b.metrics.totalRevenue - a.metrics.totalRevenue)
        const totalClients = clients.length
        const activeClients = clientMetrics.filter(c => c.metrics.activeProjects > 0).length
        const totalClientRevenue = clientMetrics.reduce((sum, c) => sum + c.metrics.totalRevenue, 0)
        const avgClientValue = totalClients > 0 ? Math.round(totalClientRevenue / totalClients) : 0

        const healthBreakdown = {
            excellent: clientMetrics.filter(c => c.metrics.health === 'excellent').length,
            good: clientMetrics.filter(c => c.metrics.health === 'good').length,
            warning: clientMetrics.filter(c => c.metrics.health === 'warning').length,
            critical: clientMetrics.filter(c => c.metrics.health === 'critical').length,
        }

        return NextResponse.json({ clients: sortedClients, summary: { totalClients, activeClients, totalRevenue: totalClientRevenue, avgClientValue }, healthBreakdown })
    } catch (error) {
        console.error('Client analytics error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
