import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { currentPassword, newPassword } = body

        if (!currentPassword || !newPassword) return NextResponse.json({ error: 'Both passwords are required' }, { status: 400 })
        if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

        // Verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email!, password: currentPassword })
        if (signInError) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
        if (updateError) return NextResponse.json({ error: 'Failed to update password' }, { status: 400 })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Password change error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
