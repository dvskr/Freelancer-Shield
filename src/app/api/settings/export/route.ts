import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const body = await request.json()
        const { type } = body // 'all', 'clients', 'projects', 'invoices', 'time'

        let data: Record<string, any> = {}

        if (type === 'all' || type === 'profile') {
            data.profile = await prisma.user.findUnique({
                where: { id: profile.id },
                select: { firstName: true, lastName: true, email: true, phone: true, businessName: true, businessType: true, address: true, addressLine2: true, city: true, state: true, zipCode: true, country: true, createdAt: true },
            })
        }

        if (type === 'all' || type === 'clients') {
            data.clients = await prisma.client.findMany({
                where: { userId: profile.id },
                select: { name: true, company: true, email: true, phone: true, address: true, createdAt: true },
            })
        }

        if (type === 'all' || type === 'projects') {
            data.projects = await prisma.project.findMany({
                where: { userId: profile.id },
                include: { client: { select: { name: true } }, milestones: { select: { name: true, status: true, amount: true, dueDate: true } } },
            })
        }

        if (type === 'all' || type === 'invoices') {
            data.invoices = await prisma.invoice.findMany({
                where: { userId: profile.id },
                include: { client: { select: { name: true } }, items: true, payments: { select: { amount: true, status: true, createdAt: true } } },
            })
        }

        if (type === 'all' || type === 'time') {
            data.timeEntries = await prisma.timeEntry.findMany({
                where: { userId: profile.id },
                select: { description: true, date: true, duration: true, billable: true, billed: true, createdAt: true },
            })
        }

        return NextResponse.json({ exportedAt: new Date().toISOString(), data })
    } catch (error) {
        console.error('Export error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
