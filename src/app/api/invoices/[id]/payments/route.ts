import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - List payments for an invoice
export async function GET(request: NextRequest, { params }: RouteParams) {
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
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        const payments = await prisma.payment.findMany({
            where: { invoiceId: id },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(payments)
    } catch (error) {
        console.error('Payments GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Record a payment
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
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        const body = await request.json()
        const { amount, method, notes } = body

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        // Create payment and update invoice in transaction
        const [payment] = await prisma.$transaction([
            prisma.payment.create({
                data: {
                    invoiceId: id,
                    amount,
                    method: method || null,
                    notes: notes || null,
                    status: 'completed',
                },
            }),
            prisma.invoice.update({
                where: { id },
                data: {
                    amountPaid: { increment: amount },
                    // Mark as paid if fully paid
                    ...(invoice.amountPaid + amount >= invoice.total && {
                        status: 'paid',
                        paidAt: new Date(),
                    }),
                },
            }),
        ])

        return NextResponse.json(payment, { status: 201 })
    } catch (error) {
        console.error('Payments POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
