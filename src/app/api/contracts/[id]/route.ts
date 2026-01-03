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

        const contract = await prisma.contract.findUnique({
            where: { id, userId: profile.id },
            include: {
                client: true,
                project: { select: { id: true, name: true, code: true } },
            },
        })

        if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
        return NextResponse.json(contract)
    } catch (error) {
        console.error('Contract GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const existingContract = await prisma.contract.findUnique({
            where: { id, userId: profile.id }
        })
        if (!existingContract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })

        const body = await request.json()
        const { name, content, status, freelancerSignature } = body

        const updateData: Record<string, unknown> = {}
        if (name !== undefined) updateData.name = name
        if (content !== undefined) updateData.content = content
        if (status !== undefined) updateData.status = status

        // Handle freelancer signing
        if (freelancerSignature) {
            updateData.freelancerSignature = freelancerSignature
            updateData.freelancerSignedAt = new Date()
        }

        // Handle sending to client
        if (status === 'sent' && existingContract.status === 'draft') {
            updateData.sentAt = new Date()
        }

        const contract = await prisma.contract.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(contract)
    } catch (error) {
        console.error('Contract PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        await prisma.contract.delete({ where: { id, userId: profile.id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Contract DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
