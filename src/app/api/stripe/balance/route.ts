import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { stripe } from '@/lib/stripe/server'

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

        // Get balance
        const balance = await stripe.balance.retrieve({
            stripeAccount: profile.stripeAccountId,
        })

        // Get recent payouts
        const payouts = await stripe.payouts.list({
            limit: 10,
        }, {
            stripeAccount: profile.stripeAccountId,
        })

        return NextResponse.json({
            available: balance.available.map(b => ({
                amount: b.amount,
                currency: b.currency,
            })),
            pending: balance.pending.map(b => ({
                amount: b.amount,
                currency: b.currency,
            })),
            payouts: payouts.data.map(p => ({
                id: p.id,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                arrivalDate: new Date(p.arrival_date * 1000),
                createdAt: new Date(p.created * 1000),
            })),
        })
    } catch (error) {
        console.error('Balance fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
