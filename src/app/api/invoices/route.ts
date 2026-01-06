import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { invoiceSchema } from '@/lib/validations/invoice'
import { generateInvoiceNumber } from '@/lib/utils'
import { rateLimit } from '@/lib/security/rate-limit'
import { sanitizeText } from '@/lib/security/sanitize'
import logger from '@/lib/logger'

// GET - List all invoices
export async function GET(request: NextRequest) {
    const rateLimitResult = await rateLimit(request, 'standard')
    if (rateLimitResult) return rateLimitResult

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

        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')
        const clientId = searchParams.get('clientId')
        const query = sanitizeText(searchParams.get('q') || '')

        const invoices = await prisma.invoice.findMany({
            where: {
                userId: profile.id,
                ...(status && status !== 'all' && { status }),
                ...(clientId && { clientId }),
                ...(query && {
                    OR: [
                        { invoiceNumber: { contains: query, mode: 'insensitive' } },
                        { client: { name: { contains: query, mode: 'insensitive' } } },
                    ],
                }),
            },
            include: {
                client: { select: { id: true, name: true, company: true } },
                project: { select: { id: true, name: true } },
                _count: { select: { items: true, payments: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(invoices)
    } catch (error) {
        logger.error('Invoices GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new invoice
export async function POST(request: NextRequest) {
    const rateLimitResult = await rateLimit(request, 'standard')
    if (rateLimitResult) return rateLimitResult

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

        const body = await request.json()
        const validated = invoiceSchema.parse(body)

        // Verify client belongs to user
        const client = await prisma.client.findUnique({
            where: { id: validated.clientId, userId: profile.id },
        })

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        // Generate invoice number
        const lastInvoice = await prisma.invoice.findFirst({
            where: { userId: profile.id },
            orderBy: { createdAt: 'desc' },
            select: { invoiceNumber: true },
        })
        const invoiceNumber = generateInvoiceNumber(lastInvoice?.invoiceNumber)

        // Calculate totals
        const subtotal = validated.items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice)
        }, 0)
        const taxAmount = Math.round(subtotal * (validated.taxRate / 100))
        const total = subtotal + taxAmount - validated.discountAmount

        // Sanitize notes
        const sanitizedNotes = validated.notes ? sanitizeText(validated.notes) : null

        // Create invoice with items in transaction
        const invoice = await prisma.$transaction(async (tx) => {
            const inv = await tx.invoice.create({
                data: {
                    userId: profile.id,
                    clientId: validated.clientId,
                    projectId: validated.projectId || null,
                    invoiceNumber,
                    status: 'draft',
                    issueDate: new Date(),
                    dueDate: new Date(validated.dueDate),
                    subtotal,
                    taxRate: validated.taxRate,
                    taxAmount,
                    discountAmount: validated.discountAmount,
                    total,
                    notes: sanitizedNotes,
                },
            })

            // Create line items with sanitized descriptions
            for (const item of validated.items) {
                await tx.invoiceItem.create({
                    data: {
                        invoiceId: inv.id,
                        description: sanitizeText(item.description),
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        amount: item.quantity * item.unitPrice,
                        milestoneId: item.milestoneId || null,
                    },
                })
            }

            return inv
        })

        return NextResponse.json(invoice, { status: 201 })
    } catch (error) {
        logger.error('Invoices POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
