import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { timeEntrySchema } from '@/lib/validations/time-entry'

// GET - List time entries
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
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const clientId = searchParams.get('clientId')
        const projectId = searchParams.get('projectId')
        const billable = searchParams.get('billable')
        const billed = searchParams.get('billed')

        const where: Record<string, unknown> = { userId: profile.id }

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            }
        } else if (startDate) {
            where.date = { gte: new Date(startDate) }
        } else if (endDate) {
            where.date = { lte: new Date(endDate) }
        }

        if (clientId) where.clientId = clientId
        if (projectId) where.projectId = projectId
        if (billable !== null && billable !== undefined) where.billable = billable === 'true'
        if (billed !== null && billed !== undefined) where.billed = billed === 'true'

        const timeEntries = await prisma.timeEntry.findMany({
            where,
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
                milestone: { select: { id: true, name: true } },
            },
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        })

        return NextResponse.json(timeEntries)
    } catch (error) {
        console.error('Time entries GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create time entry
export async function POST(request: NextRequest) {
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

        const body = await request.json()
        const validation = timeEntrySchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const data = validation.data

        // Determine hourly rate
        let hourlyRate = data.hourlyRate
        if (!hourlyRate && data.projectId) {
            const project = await prisma.project.findUnique({
                where: { id: data.projectId },
                select: { hourlyRate: true, client: { select: { defaultHourlyRate: true } } },
            })
            hourlyRate = project?.hourlyRate || project?.client?.defaultHourlyRate || null
        } else if (!hourlyRate && data.clientId) {
            const client = await prisma.client.findUnique({
                where: { id: data.clientId },
                select: { defaultHourlyRate: true },
            })
            hourlyRate = client?.defaultHourlyRate || null
        }

        const timeEntry = await prisma.timeEntry.create({
            data: {
                userId: profile.id,
                description: data.description,
                date: new Date(data.date),
                startTime: data.startTime ? new Date(data.startTime) : null,
                endTime: data.endTime ? new Date(data.endTime) : null,
                duration: data.duration,
                billable: data.billable,
                hourlyRate,
                clientId: data.clientId || null,
                projectId: data.projectId || null,
                milestoneId: data.milestoneId || null,
                tags: data.tags,
                notes: data.notes || null,
            },
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
        })

        return NextResponse.json(timeEntry, { status: 201 })
    } catch (error) {
        console.error('Time entry POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
