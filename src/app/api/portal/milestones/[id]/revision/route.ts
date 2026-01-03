import { NextRequest, NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal/auth'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const session = await getPortalSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { feedback } = body

        if (!feedback?.trim()) {
            return NextResponse.json({ error: 'Feedback is required' }, { status: 400 })
        }

        const milestone = await prisma.milestone.findFirst({
            where: {
                id,
                project: { clientId: session.client.id },
                status: 'pending_approval',
            },
        })

        if (!milestone) {
            return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
        }

        // Update milestone and all deliverables
        await prisma.$transaction([
            prisma.milestone.update({
                where: { id },
                data: { status: 'in_progress' },
            }),
            prisma.deliverable.updateMany({
                where: { milestoneId: id },
                data: {
                    status: 'rejected',
                    feedback,
                },
            }),
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Milestone revision error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
