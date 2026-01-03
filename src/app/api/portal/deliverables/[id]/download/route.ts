import { NextRequest, NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal/auth'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const session = await getPortalSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const deliverable = await prisma.deliverable.findFirst({
            where: {
                id,
                milestone: {
                    project: { clientId: session.client.id },
                },
            },
        })

        if (!deliverable) {
            return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 })
        }

        if (!deliverable.fileUrl) {
            return NextResponse.json({ error: 'No file attached' }, { status: 404 })
        }

        // Redirect to the file URL
        return NextResponse.redirect(deliverable.fileUrl)
    } catch (error) {
        console.error('Deliverable download error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
