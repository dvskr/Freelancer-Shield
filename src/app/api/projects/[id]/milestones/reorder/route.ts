import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

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

        const project = await prisma.project.findUnique({
            where: { id, userId: profile.id },
        })

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        const body = await request.json()
        const { order } = body // Array of { id, orderIndex }

        // Update all milestones in a transaction
        await prisma.$transaction(
            order.map((item: { id: string; orderIndex: number }) =>
                prisma.milestone.update({
                    where: { id: item.id },
                    data: { orderIndex: item.orderIndex },
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Milestone reorder error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
