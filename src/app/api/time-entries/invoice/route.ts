import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { generateInvoiceNumber } from '@/lib/utils'

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

        const body = await request.json()
        const { timeEntryIds, clientId, projectId, dueDate, notes, groupByProject } = body

        if (!timeEntryIds || timeEntryIds.length === 0) {
            return NextResponse.json({ error: 'No time entries selected' }, { status: 400 })
        }

        if (!clientId) {
            return NextResponse.json({ error: 'Client is required' }, { status: 400 })
        }

        const entries = await prisma.timeEntry.findMany({
            where: {
                id: { in: timeEntryIds },
                userId: profile.id,
                billed: false,
                isRunning: false,
            },
            include: {
                project: { select: { name: true } },
            },
        })

        if (entries.length === 0) {
            return NextResponse.json({ error: 'No valid time entries found' }, { status: 400 })
        }

        let lineItems: { description: string; quantity: number; unitPrice: number }[] = []

        if (groupByProject) {
            const byProject = entries.reduce((acc, entry) => {
                const key = entry.projectId || 'no-project'
                if (!acc[key]) {
                    acc[key] = {
                        name: entry.project?.name || 'General Work',
                        minutes: 0,
                        rate: entry.hourlyRate || 0,
                    }
                }
                acc[key].minutes += entry.duration
                if (entry.hourlyRate && entry.hourlyRate > acc[key].rate) {
                    acc[key].rate = entry.hourlyRate
                }
                return acc
            }, {} as Record<string, { name: string; minutes: number; rate: number }>)

            lineItems = Object.values(byProject).map((group) => ({
                description: group.name,
                quantity: Math.round((group.minutes / 60) * 100) / 100,
                unitPrice: group.rate,
            }))
        } else {
            lineItems = entries.map((entry) => ({
                description: entry.description,
                quantity: Math.round((entry.duration / 60) * 100) / 100,
                unitPrice: entry.hourlyRate || 0,
            }))
        }

        const subtotal = lineItems.reduce(
            (sum, item) => sum + Math.round(item.quantity * item.unitPrice),
            0
        )

        // Get last invoice number for this user
        const lastInvoice = await prisma.invoice.findFirst({
            where: { userId: profile.id },
            orderBy: { createdAt: 'desc' },
            select: { invoiceNumber: true },
        })

        const invoiceNumber = generateInvoiceNumber(lastInvoice?.invoiceNumber)

        const invoice = await prisma.$transaction(async (tx) => {
            const newInvoice = await tx.invoice.create({
                data: {
                    userId: profile.id,
                    clientId,
                    projectId: projectId || null,
                    invoiceNumber,
                    status: 'draft',
                    issueDate: new Date(),
                    dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    subtotal,
                    taxRate: 0,
                    taxAmount: 0,
                    discountAmount: 0,
                    total: subtotal,
                    notes: notes || `Generated from ${entries.length} time entries`,
                    items: {
                        create: lineItems.map((item) => ({
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: Math.round(item.quantity * item.unitPrice),
                        })),
                    },
                },
                include: {
                    items: true,
                },
            })

            await tx.timeEntry.updateMany({
                where: { id: { in: timeEntryIds } },
                data: {
                    billed: true,
                    invoiceId: newInvoice.id,
                },
            })

            return newInvoice
        })

        return NextResponse.json(invoice, { status: 201 })
    } catch (error) {
        console.error('Time to invoice error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
