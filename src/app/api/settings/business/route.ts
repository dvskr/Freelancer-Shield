import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const businessSchema = z.object({
    businessName: z.string().max(100).optional().nullable(),
    businessType: z.string().optional().nullable(),
    businessWebsite: z.string().url().optional().nullable().or(z.literal('')),
    businessLogo: z.string().url().optional().nullable(),
    address: z.string().max(100).optional().nullable(),
    addressLine2: z.string().max(100).optional().nullable(),
    city: z.string().max(50).optional().nullable(),
    state: z.string().max(50).optional().nullable(),
    zipCode: z.string().max(20).optional().nullable(),
    country: z.string().max(50).optional().nullable(),
    taxId: z.string().max(50).optional().nullable(),
    taxIdType: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
            select: { businessName: true, businessType: true, businessWebsite: true, businessLogo: true, address: true, addressLine2: true, city: true, state: true, zipCode: true, country: true, taxId: true, taxIdType: true },
        })

        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        return NextResponse.json(profile)
    } catch (error) {
        console.error('Business GET error:', error)
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
        const validation = businessSchema.safeParse(body)
        if (!validation.success) return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 })

        const data = validation.data

        const updated = await prisma.user.update({
            where: { id: profile.id },
            data: {
                businessName: data.businessName || null,
                businessType: data.businessType || null,
                businessWebsite: data.businessWebsite || null,
                businessLogo: data.businessLogo || null,
                address: data.address || null,
                addressLine2: data.addressLine2 || null,
                city: data.city || null,
                state: data.state || null,
                zipCode: data.zipCode || null,
                country: data.country || null,
                taxId: data.taxId || null,
                taxIdType: data.taxIdType || null,
            },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Business PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
