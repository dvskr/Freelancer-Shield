import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { milestoneUpdateSchema } from '@/lib/validations/milestone'

interface RouteParams {
    params: Promise<{ id: string; milestoneId: string }>
}

// GET - Get a single milestone
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id, milestoneId } = await params
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

        const project = await prisma.project.findUnique({
            where: { id, userId: profile.id },
        })

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        const milestone = await prisma.milestone.findUnique({
            where: { id: milestoneId, projectId: id },
            include: {
                deliverables: { orderBy: { createdAt: 'desc' } },
            },
        })

        if (!milestone) {
            return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
        }

        return NextResponse.json(milestone)
    } catch (error) {
        console.error('Milestone GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update a milestone
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id, milestoneId } = await params
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

        const project = await prisma.project.findUnique({
            where: { id, userId: profile.id },
        })

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        const body = await request.json()
        const validated = milestoneUpdateSchema.parse(body)

        const milestone = await prisma.milestone.update({
            where: { id: milestoneId },
            data: {
                ...(validated.name && { name: validated.name }),
                ...(validated.description !== undefined && { description: validated.description || null }),
                ...(validated.amount !== undefined && { amount: validated.amount }),
                ...(validated.dueDate !== undefined && {
                    dueDate: validated.dueDate ? new Date(validated.dueDate) : null
                }),
                ...(validated.status && { status: validated.status }),
                ...(validated.status === 'approved' && { approvedAt: new Date() }),
                ...(validated.orderIndex !== undefined && { orderIndex: validated.orderIndex }),
            },
        })

        return NextResponse.json(milestone)
    } catch (error) {
        console.error('Milestone PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete a milestone
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id, milestoneId } = await params
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

        const project = await prisma.project.findUnique({
            where: { id, userId: profile.id },
        })

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        await prisma.milestone.delete({
            where: { id: milestoneId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Milestone DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
