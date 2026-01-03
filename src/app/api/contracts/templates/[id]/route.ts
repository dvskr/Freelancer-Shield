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

        const template = await prisma.contractTemplate.findUnique({
            where: { id, userId: profile.id },
        })

        if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        return NextResponse.json(template)
    } catch (error) {
        console.error('Template GET error:', error)
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

        const existingTemplate = await prisma.contractTemplate.findUnique({
            where: { id, userId: profile.id }
        })
        if (!existingTemplate) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

        const body = await request.json()
        const { name, description, content, isDefault } = body

        // If setting as default, unset current default
        if (isDefault && !existingTemplate.isDefault) {
            await prisma.contractTemplate.updateMany({
                where: { userId: profile.id, isDefault: true },
                data: { isDefault: false },
            })
        }

        const template = await prisma.contractTemplate.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description: description || null }),
                ...(content !== undefined && { content }),
                ...(isDefault !== undefined && { isDefault }),
            },
        })

        return NextResponse.json(template)
    } catch (error) {
        console.error('Template PATCH error:', error)
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

        await prisma.contractTemplate.delete({ where: { id, userId: profile.id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Template DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
