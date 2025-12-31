import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { generatePortalToken } from '@/lib/utils'

interface RouteParams {
    params: Promise<{ id: string }>
}

// POST - Generate a new portal token for a client
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

        // Verify the client belongs to this user
        const existingClient = await prisma.client.findUnique({
            where: {
                id,
                userId: profile.id,
            },
        })

        if (!existingClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        // Generate new token
        const portalToken = generatePortalToken()

        // Token expires in 30 days
        const portalTokenExp = new Date()
        portalTokenExp.setDate(portalTokenExp.getDate() + 30)

        // Update the client with the new token
        const client = await prisma.client.update({
            where: { id },
            data: {
                portalToken,
                portalTokenExp,
            },
        })

        return NextResponse.json({
            portalToken: client.portalToken,
            portalTokenExp: client.portalTokenExp,
        })
    } catch (error) {
        console.error('Portal token POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Revoke a client's portal token
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

        // Verify the client belongs to this user
        const existingClient = await prisma.client.findUnique({
            where: {
                id,
                userId: profile.id,
            },
        })

        if (!existingClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        // Remove the token
        await prisma.client.update({
            where: { id },
            data: {
                portalToken: null,
                portalTokenExp: null,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Portal token DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
