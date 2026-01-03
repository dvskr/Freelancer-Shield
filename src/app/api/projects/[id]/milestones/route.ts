import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { milestoneSchema } from '@/lib/validations/milestone'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - List milestones for a project
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

        // Verify project belongs to user
        const project = await prisma.project.findUnique({
            where: { id, userId: profile.id },
        })

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        const milestones = await prisma.milestone.findMany({
            where: { projectId: id },
            include: {
                _count: { select: { deliverables: true } },
            },
            orderBy: { orderIndex: 'asc' },
        })

        return NextResponse.json(milestones)
    } catch (error) {
        console.error('Milestones GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new milestone
export async function POST(request: NextRequest, { params }: RouteParams) {
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

        // Verify project belongs to user
        const project = await prisma.project.findUnique({
            where: { id, userId: profile.id },
        })

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        const body = await request.json()
        const validated = milestoneSchema.parse(body)

        // Get next order index
        const lastMilestone = await prisma.milestone.findFirst({
            where: { projectId: id },
            orderBy: { orderIndex: 'desc' },
        })
        const nextOrderIndex = lastMilestone ? lastMilestone.orderIndex + 1 : 0

        const milestone = await prisma.milestone.create({
            data: {
                projectId: id,
                name: validated.name,
                description: validated.description || null,
                amount: validated.amount,
                dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
                orderIndex: nextOrderIndex,
                status: 'pending',
            },
        })

        return NextResponse.json(milestone, { status: 201 })
    } catch (error) {
        console.error('Milestones POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
