import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { DEFAULT_INVOICE_SETTINGS } from '@/lib/types/settings'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { invoiceSettings: true } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const settings = { ...DEFAULT_INVOICE_SETTINGS, ...(profile.invoiceSettings as object || {}) }
        return NextResponse.json(settings)
    } catch (error) {
        console.error('Invoice settings GET error:', error)
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
        const currentSettings = (profile.invoiceSettings as object) || {}
        const newSettings = { ...DEFAULT_INVOICE_SETTINGS, ...currentSettings, ...body }

        await prisma.user.update({ where: { id: profile.id }, data: { invoiceSettings: newSettings } })
        return NextResponse.json(newSettings)
    } catch (error) {
        console.error('Invoice settings PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
