import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { deliverableSchema } from '@/lib/validations/milestone'

interface RouteParams {
    params: Promise<{ id: string; milestoneId: string }>
}

// GET - List deliverables for a milestone
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

        const deliverables = await prisma.deliverable.findMany({
            where: { milestoneId },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(deliverables)
    } catch (error) {
        console.error('Deliverables GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new deliverable
export async function POST(request: NextRequest, { params }: RouteParams) {
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
        })

        if (!milestone) {
            return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
        }

        const body = await request.json()
        const { name, description, fileUrl, fileType, fileSize } = body

        const deliverable = await prisma.deliverable.create({
            data: {
                milestoneId,
                name,
                description: description || null,
                fileUrl: fileUrl || null,
                fileType: fileType || null,
                fileSize: fileSize || null,
                status: 'pending',
            },
        })

        // Update milestone status to in_progress if it's pending
        if (milestone.status === 'pending') {
            await prisma.milestone.update({
                where: { id: milestoneId },
                data: { status: 'in_progress' },
            })
        }

        return NextResponse.json(deliverable, { status: 201 })
    } catch (error) {
        console.error('Deliverables POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
