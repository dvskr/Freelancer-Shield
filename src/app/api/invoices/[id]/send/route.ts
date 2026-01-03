import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        const { id } = await params

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { supabaseId: user.id },
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id, userId: profile.id },
            include: { client: true },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Update invoice status
        const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: {
                status: 'sent',
                sentAt: new Date(),
            },
        })

        // TODO: Send email to client with invoice link using Resend
        // For now, just update the status

        return NextResponse.json(updatedInvoice)
    } catch (error) {
        console.error('Invoice send error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
