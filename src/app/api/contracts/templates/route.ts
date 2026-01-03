import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const templates = await prisma.contractTemplate.findMany({
            where: { userId: profile.id },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        })

        return NextResponse.json(templates)
    } catch (error) {
        console.error('Contract templates GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const body = await request.json()
        const { name, description, content, isDefault } = body

        if (!name || !content) {
            return NextResponse.json({ error: 'Name and content are required' }, { status: 400 })
        }

        // If this is being set as default, unset the current default
        if (isDefault) {
            await prisma.contractTemplate.updateMany({
                where: { userId: profile.id, isDefault: true },
                data: { isDefault: false },
            })
        }

        const template = await prisma.contractTemplate.create({
            data: {
                userId: profile.id,
                name,
                description: description || null,
                content,
                isDefault: isDefault || false
            },
        })

        return NextResponse.json(template, { status: 201 })
    } catch (error) {
        console.error('Contract templates POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
