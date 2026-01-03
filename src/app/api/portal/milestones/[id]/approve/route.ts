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

        const updated = await prisma.milestone.update({
            where: { id },
            data: {
                status: 'approved',
                approvedAt: new Date(),
            },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Milestone approve error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
