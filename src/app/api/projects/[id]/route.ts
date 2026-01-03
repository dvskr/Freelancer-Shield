import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { projectUpdateSchema } from '@/lib/validations/project'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const project = await prisma.project.findUnique({
            where: { id, userId: profile.id },
            include: {
                client: true,
                milestones: { orderBy: { orderIndex: 'asc' }, include: { deliverables: true } },
                invoices: { orderBy: { createdAt: 'desc' } },
                contracts: { orderBy: { createdAt: 'desc' } },
                revisions: { orderBy: { createdAt: 'desc' } },
            },
        })

        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        return NextResponse.json(project)
    } catch (error) {
        console.error('Project GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const existingProject = await prisma.project.findUnique({
            where: { id, userId: profile.id }
        })
        if (!existingProject) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

        const body = await request.json()
        const validated = projectUpdateSchema.parse(body)

        const project = await prisma.project.update({
            where: { id },
            data: {
                ...(validated.name && { name: validated.name }),
                ...(validated.description !== undefined && { description: validated.description || null }),
                ...(validated.totalAmount !== undefined && { totalAmount: validated.totalAmount }),
                ...(validated.startDate !== undefined && { startDate: validated.startDate ? new Date(validated.startDate) : null }),
                ...(validated.endDate !== undefined && { endDate: validated.endDate ? new Date(validated.endDate) : null }),
                ...(validated.revisionsCap !== undefined && { revisionsCap: validated.revisionsCap }),
                ...(validated.extraRevisionFee !== undefined && { extraRevisionFee: validated.extraRevisionFee }),
                ...(validated.status && { status: validated.status }),
            },
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error('Project PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        await prisma.project.delete({ where: { id, userId: profile.id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Project DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
