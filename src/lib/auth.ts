import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export interface AuthUser {
    id: string
    email: string
}

export interface UserProfile {
    id: string
    supabaseId: string
    email: string
    firstName: string | null
    lastName: string | null
    businessName: string | null
    phone: string | null
    avatarUrl: string | null
    timezone: string
    currency: string
    defaultPaymentTerms: number
    subscriptionStatus: string
    trialEndsAt: Date | null
    notificationSettings?: any
}

/**
 * Require authentication - redirects to /login if not authenticated
 */
export async function requireAuth(): Promise<{ user: AuthUser; profile: UserProfile }> {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // Get or create profile
    let profile = await prisma.user.findUnique({
        where: { supabaseId: user.id }
    })

    // Auto-create profile if doesn't exist
    if (!profile && user.email) {
        profile = await prisma.user.create({
            data: {
                supabaseId: user.id,
                email: user.email,
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
            }
        })
    }

    if (!profile) {
        redirect('/login')
    }

    return {
        user: { id: user.id, email: user.email! },
        profile: profile as UserProfile
    }
}

/**
 * Get current user without requiring auth (returns null if not logged in)
 */
export async function getCurrentUser(): Promise<{ user: AuthUser; profile: UserProfile | null } | null> {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    const profile = await prisma.user.findUnique({
        where: { supabaseId: user.id }
    })

    return {
        user: { id: user.id, email: user.email! },
        profile: profile as UserProfile | null
    }
}

/**
 * Check if user has active subscription or trial
 */
export async function requireActiveSubscription() {
    const { profile } = await requireAuth()

    const validStatuses = ['trialing', 'active']

    if (!validStatuses.includes(profile.subscriptionStatus)) {
        redirect('/settings/billing?status=inactive')
    }

    if (profile.subscriptionStatus === 'trialing' && profile.trialEndsAt) {
        if (new Date(profile.trialEndsAt) < new Date()) {
            redirect('/settings/billing?status=trial_expired')
        }
    }

    return { profile }
}
