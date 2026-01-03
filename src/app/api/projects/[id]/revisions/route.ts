import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

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
            where: { id, userId: profile.id }
        })
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

        const revisions = await prisma.revision.findMany({
            where: { projectId: id },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(revisions)
    } catch (error) {
        console.error('Revisions GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const project = await prisma.project.findUnique({
            where: { id, userId: profile.id }
        })
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

        const body = await request.json()
        const { description, requestedBy = 'client' } = body
        if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 })

        const isExtra = project.revisionsUsed >= project.revisionsCap
        const amount = isExtra ? project.extraRevisionFee : 0

        const [revision] = await prisma.$transaction([
            prisma.revision.create({
                data: {
                    projectId: id,
                    revisionNumber: project.revisionsUsed + 1,
                    description,
                    requestedBy,
                    isExtra,
                    amount,
                    status: 'pending',
                },
            }),
            prisma.project.update({
                where: { id },
                data: { revisionsUsed: { increment: 1 } },
            }),
        ])

        return NextResponse.json(revision, { status: 201 })
    } catch (error) {
        console.error('Revisions POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
