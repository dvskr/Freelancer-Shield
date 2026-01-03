import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string; milestoneId: string; deliverableId: string }>
}

// GET - Get a single deliverable
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id, milestoneId, deliverableId } = await params
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

        const deliverable = await prisma.deliverable.findUnique({
            where: { id: deliverableId },
        })

        if (!deliverable) {
            return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 })
        }

        return NextResponse.json(deliverable)
    } catch (error) {
        console.error('Deliverable GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update a deliverable
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id, milestoneId, deliverableId } = await params
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

        const body = await request.json()

        const deliverable = await prisma.deliverable.update({
            where: { id: deliverableId },
            data: body,
        })

        return NextResponse.json(deliverable)
    } catch (error) {
        console.error('Deliverable PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete a deliverable
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id, milestoneId, deliverableId } = await params
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

        await prisma.deliverable.delete({
            where: { id: deliverableId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Deliverable DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
