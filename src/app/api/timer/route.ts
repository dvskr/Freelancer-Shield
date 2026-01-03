import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { timerStartSchema, timerStopSchema } from '@/lib/validations/time-entry'

// GET - Get current running timer
export async function GET() {
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

        const runningTimer = await prisma.timeEntry.findFirst({
            where: {
                userId: profile.id,
                isRunning: true,
            },
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
        })

        return NextResponse.json(runningTimer)
    } catch (error) {
        console.error('Timer GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Start a new timer
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

        // Check for existing running timer
        const existingTimer = await prisma.timeEntry.findFirst({
            where: {
                userId: profile.id,
                isRunning: true,
            },
        })

        if (existingTimer) {
            return NextResponse.json(
                { error: 'Timer already running. Stop it first.' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const validation = timerStartSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const data = validation.data
        const now = new Date()

        const timer = await prisma.timeEntry.create({
            data: {
                userId: profile.id,
                description: data.description,
                date: now,
                startTime: now,
                duration: 0,
                billable: data.billable,
                clientId: data.clientId || null,
                projectId: data.projectId || null,
                milestoneId: data.milestoneId || null,
                tags: data.tags,
                isRunning: true,
                timerStartedAt: now,
            },
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
        })

        return NextResponse.json(timer, { status: 201 })
    } catch (error) {
        console.error('Timer POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Stop the running timer
export async function PATCH(request: NextRequest) {
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

        const runningTimer = await prisma.timeEntry.findFirst({
            where: {
                userId: profile.id,
                isRunning: true,
            },
        })

        if (!runningTimer) {
            return NextResponse.json({ error: 'No timer running' }, { status: 400 })
        }

        const body = await request.json()
        const validation = timerStopSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const data = validation.data
        const now = new Date()
        const startTime = runningTimer.timerStartedAt || runningTimer.startTime || runningTimer.createdAt
        const durationMs = now.getTime() - startTime.getTime()
        const durationMinutes = Math.max(1, Math.round(durationMs / 60000))

        const timer = await prisma.timeEntry.update({
            where: { id: runningTimer.id },
            data: {
                description: data.description || runningTimer.description,
                endTime: now,
                duration: durationMinutes,
                isRunning: false,
                timerStartedAt: null,
                notes: data.notes || null,
            },
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
        })

        return NextResponse.json(timer)
    } catch (error) {
        console.error('Timer PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Discard the running timer
export async function DELETE() {
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

        const runningTimer = await prisma.timeEntry.findFirst({
            where: {
                userId: profile.id,
                isRunning: true,
            },
        })

        if (!runningTimer) {
            return NextResponse.json({ error: 'No timer running' }, { status: 400 })
        }

        await prisma.timeEntry.delete({
            where: { id: runningTimer.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Timer DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
