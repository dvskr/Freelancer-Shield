import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/lib/types/settings'
import { notificationSettingsSchema } from '@/lib/validations/settings'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { notificationSettings: true } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const settings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...(profile.notificationSettings as object || {}) }
        return NextResponse.json(settings)
    } catch (error) {
        console.error('Notification settings GET error:', error)
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
        const validation = notificationSettingsSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 })
        }

        const currentSettings = (profile.notificationSettings as object) || {}
        const newSettings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...currentSettings, ...validation.data }

        await prisma.user.update({ where: { id: profile.id }, data: { notificationSettings: newSettings } })
        return NextResponse.json(newSettings)
    } catch (error) {
        console.error('Notification settings PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

