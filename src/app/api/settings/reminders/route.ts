import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { mergeWithDefaults, ReminderSettings } from '@/lib/reminders/types'
import { reminderSettingsSchema } from '@/lib/validations/settings'

// GET - Get reminder settings
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
            select: { reminderSettings: true },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const settings = mergeWithDefaults(profile.reminderSettings as Partial<ReminderSettings>)

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Reminder settings GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT - Update reminder settings
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validation = reminderSettingsSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 })
        }

        await prisma.user.update({
            where: { supabaseId: user.id },
            data: { reminderSettings: validation.data },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Reminder settings PUT error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
