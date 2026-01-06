import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { clientSchema } from '@/lib/validations/client'
import { ZodError } from 'zod'
import { rateLimit } from '@/lib/security/rate-limit'
import { sanitizeText } from '@/lib/security/sanitize'
import logger from '@/lib/logger'

// GET - List all clients for the current user
export async function GET(request: NextRequest) {
    // Standard rate limiting
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

        // Get search query from URL and sanitize
        const searchParams = request.nextUrl.searchParams
        const search = sanitizeText(searchParams.get('q') || '')

        const clients = await prisma.client.findMany({
            where: {
                userId: profile.id,
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { company: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            },
            include: {
                _count: {
                    select: {
                        projects: true,
                        invoices: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(clients)
    } catch (error) {
        logger.error('Clients GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new client
export async function POST(request: NextRequest) {
    // Standard rate limiting
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

        // Validate input
        const validated = clientSchema.parse(body)

        // Sanitize text fields
        const sanitizedName = sanitizeText(validated.name)
        const sanitizedNotes = validated.notes ? sanitizeText(validated.notes) : null

        // Check for duplicate email for this user
        const existingClient = await prisma.client.findFirst({
            where: {
                userId: profile.id,
                email: validated.email,
            },
        })

        if (existingClient) {
            return NextResponse.json(
                { error: 'A client with this email already exists' },
                { status: 400 }
            )
        }

        // Create the client with sanitized data
        const client = await prisma.client.create({
            data: {
                userId: profile.id,
                name: sanitizedName,
                email: validated.email,
                phone: validated.phone || null,
                company: validated.company ? sanitizeText(validated.company) : null,
                address: validated.address || null,
                city: validated.city || null,
                state: validated.state || null,
                zipCode: validated.zipCode || null,
                country: validated.country,
                notes: sanitizedNotes,
            },
        })

        return NextResponse.json(client, { status: 201 })
    } catch (error) {
        logger.error('Clients POST error:', error)

        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
