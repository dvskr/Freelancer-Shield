import { NextRequest, NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit } from '@/lib/security/rate-limit'
import logger from '@/lib/logger'

const messageSchema = z.object({
    content: z.string().min(1, 'Message is required').max(5000),
})

// GET - Get all messages
export async function GET(request: NextRequest) {
    // Rate limit public portal endpoints
    const rateLimitResult = await rateLimit(request, 'public')
    if (rateLimitResult) return rateLimitResult

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
        logger.error('Messages GET error:', error)
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
        const validation = messageSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 })
        }

        const message = await prisma.portalMessage.create({
            data: {
                clientId: session.client.id,
                userId: session.client.userId,
                content: validation.data.content.trim(),
                senderType: 'client',
            },
        })

        return NextResponse.json(message, { status: 201 })
    } catch (error) {
        logger.error('Messages POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

