import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { clientSchema } from '@/lib/validations/client'
import { ZodError } from 'zod'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Get a single client
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
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

        const client = await prisma.client.findUnique({
            where: {
                id,
                userId: profile.id,
            },
            include: {
                projects: {
                    orderBy: { createdAt: 'desc' },
                },
                invoices: {
                    orderBy: { createdAt: 'desc' },
                },
                contracts: {
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        projects: true,
                        invoices: true,
                        contracts: true,
                    },
                },
            },
        })

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        return NextResponse.json(client)
    } catch (error) {
        console.error('Client GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update a client
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
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

        // Verify the client belongs to this user
        const existingClient = await prisma.client.findUnique({
            where: {
                id,
                userId: profile.id,
            },
        })

        if (!existingClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        const body = await request.json()

        // Validate input (partial validation for updates)
        const validated = clientSchema.partial().parse(body)

        // Check for duplicate email if email is being changed
        if (validated.email && validated.email !== existingClient.email) {
            const duplicateClient = await prisma.client.findFirst({
                where: {
                    userId: profile.id,
                    email: validated.email,
                    NOT: { id },
                },
            })

            if (duplicateClient) {
                return NextResponse.json(
                    { error: 'A client with this email already exists' },
                    { status: 400 }
                )
            }
        }

        // Update the client
        const client = await prisma.client.update({
            where: { id },
            data: {
                ...(validated.name && { name: validated.name }),
                ...(validated.email && { email: validated.email }),
                ...(validated.phone !== undefined && { phone: validated.phone || null }),
                ...(validated.company !== undefined && { company: validated.company || null }),
                ...(validated.address !== undefined && { address: validated.address || null }),
                ...(validated.city !== undefined && { city: validated.city || null }),
                ...(validated.state !== undefined && { state: validated.state || null }),
                ...(validated.zipCode !== undefined && { zipCode: validated.zipCode || null }),
                ...(validated.country && { country: validated.country }),
                ...(validated.notes !== undefined && { notes: validated.notes || null }),
            },
        })

        return NextResponse.json(client)
    } catch (error) {
        console.error('Client PATCH error:', error)

        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete a client
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
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

        // Verify the client belongs to this user
        const existingClient = await prisma.client.findUnique({
            where: {
                id,
                userId: profile.id,
            },
        })

        if (!existingClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        // Delete the client (cascade will handle related records)
        await prisma.client.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Client DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
