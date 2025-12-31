import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Check if profile exists, create if not
            const existingProfile = await prisma.user.findUnique({
                where: { supabaseId: data.user.id }
            })

            if (!existingProfile && data.user.email) {
                const metadata = data.user.user_metadata || {}

                await prisma.user.create({
                    data: {
                        supabaseId: data.user.id,
                        email: data.user.email,
                        firstName: metadata.first_name || null,
                        lastName: metadata.last_name || null,
                        businessName: metadata.business_name || null,
                        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    }
                })
            }

            return NextResponse.redirect(`${origin}/dashboard`)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
