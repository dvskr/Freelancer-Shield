import { NextRequest, NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal/auth'
import prisma from '@/lib/prisma'

// GET - Get all messages
export async function GET(request: NextRequest) {
    try {
        const session = await getPortalSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const messages = await prisma.portalMessage.findMany({
            where: { clientId: session.client.id },
            orderBy: { createdAt: 'asc' },
        })

        return NextResponse.json(messages)
    } catch (error) {
        console.error('Messages GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
    try {
        const session = await getPortalSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { content } = body

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        const message = await prisma.portalMessage.create({
            data: {
                clientId: session.client.id,
                userId: session.client.userId,
                content: content.trim(),
                senderType: 'client',
            },
        })

        return NextResponse.json(message, { status: 201 })
    } catch (error) {
        console.error('Messages POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
