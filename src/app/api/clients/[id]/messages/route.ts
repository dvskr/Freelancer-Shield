import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// POST - Send a message to client
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

        const client = await prisma.client.findUnique({
            where: { id, userId: profile.id },
        })

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        const body = await request.json()
        const { content } = body

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        const message = await prisma.portalMessage.create({
            data: {
                clientId: client.id,
                userId: profile.id,
                content: content.trim(),
                senderType: 'freelancer',
            },
        })

        return NextResponse.json(message, { status: 201 })
    } catch (error) {
        console.error('Messages POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
