import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { timeEntryUpdateSchema } from '@/lib/validations/time-entry'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Get single time entry
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
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

        const timeEntry = await prisma.timeEntry.findUnique({
            where: { id, userId: profile.id },
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
                milestone: { select: { id: true, name: true } },
            },
        })

        if (!timeEntry) {
            return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
        }

        return NextResponse.json(timeEntry)
    } catch (error) {
        console.error('Time entry GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update time entry
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
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

        const existing = await prisma.timeEntry.findUnique({
            where: { id, userId: profile.id },
        })

        if (!existing) {
            return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
        }

        if (existing.billed) {
            return NextResponse.json(
                { error: 'Cannot edit billed time entry' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const validation = timeEntryUpdateSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const data = validation.data

        const timeEntry = await prisma.timeEntry.update({
            where: { id },
            data: {
                ...(data.description !== undefined && { description: data.description }),
                ...(data.date !== undefined && { date: new Date(data.date) }),
                ...(data.duration !== undefined && { duration: data.duration }),
                ...(data.billable !== undefined && { billable: data.billable }),
                ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
                ...(data.clientId !== undefined && { clientId: data.clientId }),
                ...(data.projectId !== undefined && { projectId: data.projectId }),
                ...(data.milestoneId !== undefined && { milestoneId: data.milestoneId }),
                ...(data.tags !== undefined && { tags: data.tags }),
                ...(data.notes !== undefined && { notes: data.notes }),
            },
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
        })

        return NextResponse.json(timeEntry)
    } catch (error) {
        console.error('Time entry PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete time entry
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
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

        const existing = await prisma.timeEntry.findUnique({
            where: { id, userId: profile.id },
        })

        if (!existing) {
            return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
        }

        if (existing.billed) {
            return NextResponse.json(
                { error: 'Cannot delete billed time entry' },
                { status: 400 }
            )
        }

        await prisma.timeEntry.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Time entry DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
