import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { stripe } from '@/lib/stripe/server'

// POST - Create Stripe Connect account and get onboarding link
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        let accountId = profile.stripeAccountId

        // Create Stripe Connect account if doesn't exist
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                email: user.email,
                metadata: {
                    userId: profile.id,
                },
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: 'individual',
                business_profile: {
                    name: profile.businessName || `${profile.firstName} ${profile.lastName}`,
                    url: undefined,
                },
            })

            accountId = account.id

            // Save to database
            await prisma.user.update({
                where: { id: profile.id },
                data: {
                    stripeAccountId: accountId,
                    stripeAccountStatus: 'pending',
                },
            })
        }

        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?refresh=true`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments?success=true`,
            type: 'account_onboarding',
        })

        return NextResponse.json({ url: accountLink.url })
    } catch (error) {
        console.error('Stripe Connect error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET - Get Stripe Connect account status
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
            select: {
                id: true,
                stripeAccountId: true,
                stripeAccountStatus: true,
                stripeOnboardingComplete: true,
                stripeChargesEnabled: true,
                stripePayoutsEnabled: true,
            },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        if (!profile.stripeAccountId) {
            return NextResponse.json({
                connected: false,
                status: 'not_connected',
            })
        }

        // Get latest status from Stripe
        const account = await stripe.accounts.retrieve(profile.stripeAccountId)

        // Update local status
        await prisma.user.update({
            where: { id: profile.id },
            data: {
                stripeDetailsSubmitted: account.details_submitted,
                stripeChargesEnabled: account.charges_enabled,
                stripePayoutsEnabled: account.payouts_enabled,
                stripeOnboardingComplete: account.details_submitted && account.charges_enabled,
                stripeAccountStatus: account.charges_enabled ? 'active' :
                    account.details_submitted ? 'restricted' : 'pending',
            },
        })

        return NextResponse.json({
            connected: true,
            accountId: profile.stripeAccountId,
            status: account.charges_enabled ? 'active' :
                account.details_submitted ? 'restricted' : 'pending',
            detailsSubmitted: account.details_submitted,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            requirements: account.requirements,
        })
    } catch (error) {
        console.error('Stripe status error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
