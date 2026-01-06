import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { contractSchema } from '@/lib/validations/contracts'
import { rateLimit } from '@/lib/security/rate-limit'
import { sanitizeText } from '@/lib/security/sanitize'
import logger from '@/lib/logger'

function generateContractCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'CTR-'
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

export async function GET(request: NextRequest) {
    const rateLimitResult = await rateLimit(request, 'standard')
    if (rateLimitResult) return rateLimitResult

    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const contracts = await prisma.contract.findMany({
            where: { userId: profile.id },
            include: {
                client: { select: { id: true, name: true, company: true } },
                project: { select: { id: true, name: true, code: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(contracts)
    } catch (error) {
        logger.error('Contracts GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const rateLimitResult = await rateLimit(request, 'standard')
    if (rateLimitResult) return rateLimitResult

    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const body = await request.json()
        const validation = contractSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 })
        }

        const { clientId, projectId, title, content } = validation.data

        const client = await prisma.client.findUnique({
            where: { id: clientId, userId: profile.id }
        })
        if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

        // Validate project if provided
        if (projectId) {
            const project = await prisma.project.findUnique({
                where: { id: projectId, userId: profile.id }
            })
            if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        // Generate unique contract code
        let code = generateContractCode()
        while (await prisma.contract.findUnique({ where: { code } })) {
            code = generateContractCode()
        }

        // Sanitize text fields
        const sanitizedTitle = sanitizeText(title)
        const sanitizedContent = sanitizeText(content)

        const contract = await prisma.contract.create({
            data: {
                userId: profile.id,
                clientId,
                projectId: projectId || null,
                code,
                name: sanitizedTitle,
                content: sanitizedContent,
                status: 'draft'
            },
        })

        return NextResponse.json(contract, { status: 201 })
    } catch (error) {
        logger.error('Contracts POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
