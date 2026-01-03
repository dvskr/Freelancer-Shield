import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { invoiceUpdateSchema } from '@/lib/validations/invoice'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Get a single invoice
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
            include: {
                client: true,
                project: true,
                items: {
                    include: { milestone: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'asc' },
                },
                payments: { orderBy: { createdAt: 'desc' } },
            },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        return NextResponse.json(invoice)
    } catch (error) {
        console.error('Invoice GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update an invoice
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

        const existingInvoice = await prisma.invoice.findUnique({
            where: { id, userId: profile.id },
        })

        if (!existingInvoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        const body = await request.json()
        const validated = invoiceUpdateSchema.parse(body)

        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                ...(validated.status && { status: validated.status }),
                ...(validated.dueDate && { dueDate: new Date(validated.dueDate) }),
                ...(validated.notes !== undefined && { notes: validated.notes }),
                ...(validated.taxRate !== undefined && { taxRate: validated.taxRate }),
                ...(validated.discountAmount !== undefined && { discountAmount: validated.discountAmount }),
            },
        })

        return NextResponse.json(invoice)
    } catch (error) {
        console.error('Invoice PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete an invoice
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

        await prisma.invoice.delete({
            where: { id, userId: profile.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Invoice DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
