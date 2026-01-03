import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { stripe } from '@/lib/stripe/server'

// GET - Get Stripe Express Dashboard link
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
            select: { stripeAccountId: true },
        })

        if (!profile?.stripeAccountId) {
            return NextResponse.json({ error: 'Stripe not connected' }, { status: 400 })
        }

        const loginLink = await stripe.accounts.createLoginLink(profile.stripeAccountId)

        return NextResponse.json({ url: loginLink.url })
    } catch (error) {
        console.error('Stripe dashboard error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
