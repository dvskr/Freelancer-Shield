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

        const projects = await prisma.project.findMany({
            where: { userId: profile.id },
            include: {
                client: { select: { name: true } },
                milestones: { select: { id: true, name: true, status: true, amount: true, dueDate: true } },
                timeEntries: { where: { isRunning: false }, select: { duration: true } },
                invoices: { select: { total: true, amountPaid: true, status: true } },
            },
        })

        const now = new Date()

        const projectMetrics = projects.map((project) => {
            const totalMilestones = project.milestones.length
            const completedMilestones = project.milestones.filter(m => m.status === 'approved' || m.status === 'paid').length
            const pendingApproval = project.milestones.filter(m => m.status === 'pending_approval').length
            const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

            const totalBudget = project.milestones.reduce((sum, m) => sum + m.amount, 0)
            const earnedBudget = project.milestones.filter(m => m.status === 'approved' || m.status === 'paid').reduce((sum, m) => sum + m.amount, 0)
            const collectedBudget = project.invoices.reduce((sum, inv) => sum + inv.amountPaid, 0)

            const totalHours = Math.round(project.timeEntries.reduce((sum, t) => sum + t.duration, 0) / 60)
            const estimatedHours = project.estimatedHours || 0
            const hoursOverUnder = estimatedHours > 0 ? totalHours - estimatedHours : 0

            const overdueMilestones = project.milestones.filter(m => {
                if (!m.dueDate || m.status === 'approved' || m.status === 'paid') return false
                return new Date(m.dueDate) < now
            }).length

            let healthScore = 100
            healthScore -= overdueMilestones * 15
            if (estimatedHours > 0 && totalHours > estimatedHours) {
                healthScore -= Math.min(((totalHours - estimatedHours) / estimatedHours) * 50, 30)
            }
            if (project.status === 'active' && progress < 20 && totalMilestones > 0) healthScore -= 10
            healthScore = Math.max(0, Math.round(healthScore))

            let health: 'on_track' | 'at_risk' | 'behind' | 'critical'
            if (healthScore >= 80) health = 'on_track'
            else if (healthScore >= 60) health = 'at_risk'
            else if (healthScore >= 40) health = 'behind'
            else health = 'critical'

            return {
                id: project.id, name: project.name, status: project.status, client: project.client?.name,
                startDate: project.startDate, endDate: project.endDate,
                metrics: { progress, totalMilestones, completedMilestones, pendingApproval, overdueMilestones, totalBudget, earnedBudget, collectedBudget, totalHours, estimatedHours, hoursOverUnder, healthScore, health },
            }
        })

        const activeProjects = projectMetrics.filter(p => p.status === 'active')
        const avgProgress = activeProjects.length > 0 ? Math.round(activeProjects.reduce((sum, p) => sum + p.metrics.progress, 0) / activeProjects.length) : 0
        const totalBudget = projectMetrics.reduce((sum, p) => sum + p.metrics.totalBudget, 0)
        const totalEarned = projectMetrics.reduce((sum, p) => sum + p.metrics.earnedBudget, 0)

        const healthCounts = {
            on_track: projectMetrics.filter(p => p.metrics.health === 'on_track').length,
            at_risk: projectMetrics.filter(p => p.metrics.health === 'at_risk').length,
            behind: projectMetrics.filter(p => p.metrics.health === 'behind').length,
            critical: projectMetrics.filter(p => p.metrics.health === 'critical').length,
        }

        return NextResponse.json({
            projects: projectMetrics,
            summary: { total: projects.length, active: activeProjects.length, completed: projectMetrics.filter(p => p.status === 'completed').length, avgProgress, totalBudget, totalEarned },
            healthCounts,
        })
    } catch (error) {
        console.error('Project analytics error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
