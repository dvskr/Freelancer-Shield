import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        // Delete all user data in transaction
        await prisma.$transaction([
            prisma.timeEntry.deleteMany({ where: { userId: profile.id } }),
            prisma.payment.deleteMany({ where: { invoice: { userId: profile.id } } }),
            prisma.invoiceItem.deleteMany({ where: { invoice: { userId: profile.id } } }),
            prisma.invoice.deleteMany({ where: { userId: profile.id } }),
            prisma.deliverable.deleteMany({ where: { milestone: { project: { userId: profile.id } } } }),
            prisma.milestone.deleteMany({ where: { project: { userId: profile.id } } }),
            prisma.contract.deleteMany({ where: { userId: profile.id } }),
            prisma.project.deleteMany({ where: { userId: profile.id } }),
            prisma.portalMessage.deleteMany({ where: { userId: profile.id } }),
            prisma.portalSession.deleteMany({ where: { client: { userId: profile.id } } }),
            prisma.client.deleteMany({ where: { userId: profile.id } }),
            prisma.user.delete({ where: { id: profile.id } }),
        ])

        // Sign out
        await supabase.auth.signOut()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete account error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
