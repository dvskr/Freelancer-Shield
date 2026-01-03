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

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '20')

        const [recentInvoices, recentPayments, recentProjects, recentMilestones, recentClients] = await Promise.all([
            prisma.invoice.findMany({ where: { userId: profile.id }, select: { id: true, invoiceNumber: true, status: true, total: true, createdAt: true, updatedAt: true, client: { select: { name: true } } }, orderBy: { updatedAt: 'desc' }, take: limit }),
            prisma.payment.findMany({ where: { invoice: { userId: profile.id } }, select: { id: true, amount: true, status: true, createdAt: true, invoice: { select: { invoiceNumber: true, client: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' }, take: limit }),
            prisma.project.findMany({ where: { userId: profile.id }, select: { id: true, name: true, status: true, createdAt: true, updatedAt: true, client: { select: { name: true } } }, orderBy: { updatedAt: 'desc' }, take: limit }),
            prisma.milestone.findMany({ where: { project: { userId: profile.id } }, select: { id: true, name: true, status: true, updatedAt: true, project: { select: { name: true } } }, orderBy: { updatedAt: 'desc' }, take: limit }),
            prisma.client.findMany({ where: { userId: profile.id }, select: { id: true, name: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: limit }),
        ])

        const activities: any[] = []

        recentInvoices.forEach((inv) => { activities.push({ id: `invoice-${inv.id}`, type: 'invoice', action: inv.status === 'paid' ? 'paid' : inv.status === 'sent' ? 'sent' : 'created', title: `Invoice ${inv.invoiceNumber}`, description: inv.client?.name, amount: inv.total, timestamp: inv.updatedAt, link: `/invoices/${inv.id}` }) })
        recentPayments.forEach((payment) => { if (payment.status === 'completed') { activities.push({ id: `payment-${payment.id}`, type: 'payment', action: 'received', title: `Payment received`, description: `${payment.invoice?.client?.name} - ${payment.invoice?.invoiceNumber}`, amount: payment.amount, timestamp: payment.createdAt, link: `/invoices` }) } })
        recentProjects.forEach((project) => { activities.push({ id: `project-${project.id}`, type: 'project', action: project.status === 'completed' ? 'completed' : 'updated', title: project.name, description: project.client?.name, timestamp: project.updatedAt, link: `/projects/${project.id}` }) })
        recentMilestones.forEach((milestone) => { if (milestone.status === 'pending_approval' || milestone.status === 'approved') { activities.push({ id: `milestone-${milestone.id}`, type: 'milestone', action: milestone.status === 'approved' ? 'approved' : 'pending', title: milestone.name, description: milestone.project?.name, timestamp: milestone.updatedAt, link: `/projects` }) } })
        recentClients.forEach((client) => { activities.push({ id: `client-${client.id}`, type: 'client', action: 'created', title: client.name, description: 'New client added', timestamp: client.createdAt, link: `/clients/${client.id}` }) })

        const sortedActivities = activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit)

        return NextResponse.json(sortedActivities)
    } catch (error) {
        console.error('Activity feed error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
