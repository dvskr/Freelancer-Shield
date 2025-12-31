import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// GET - Get current user's profile
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id }
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Profile GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create profile (called during signup)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { supabaseId, email, firstName, lastName, businessName } = body

        if (!supabaseId || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const profile = await prisma.user.upsert({
            where: { supabaseId },
            update: {
                firstName,
                lastName,
                businessName,
            },
            create: {
                supabaseId,
                email,
                firstName,
                lastName,
                businessName,
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            }
        })

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Profile POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update profile fields
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        const profile = await prisma.user.update({
            where: { supabaseId: user.id },
            data: body,
        })

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Profile PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
