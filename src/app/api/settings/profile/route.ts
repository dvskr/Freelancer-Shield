import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email'),
    phone: z.string().max(20).optional().nullable(),
    timezone: z.string().optional(),
    avatarUrl: z.string().url().optional().nullable(),
})

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
            select: { id: true, firstName: true, lastName: true, email: true, phone: true, timezone: true, avatarUrl: true, createdAt: true },
        })

        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        return NextResponse.json(profile)
    } catch (error) {
        console.error('Profile GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const body = await request.json()
        const validation = profileSchema.safeParse(body)
        if (!validation.success) return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 })

        const data = validation.data

        // Check if email is being changed
        if (data.email !== profile.email) {
            const existing = await prisma.user.findUnique({ where: { email: data.email } })
            if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
            const { error: updateError } = await supabase.auth.updateUser({ email: data.email })
            if (updateError) return NextResponse.json({ error: 'Failed to update email' }, { status: 400 })
        }

        const updated = await prisma.user.update({
            where: { id: profile.id },
            data: { firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone || null, timezone: data.timezone || 'America/New_York', avatarUrl: data.avatarUrl || null },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Profile PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
