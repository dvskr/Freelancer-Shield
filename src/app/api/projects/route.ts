import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { projectSchema } from '@/lib/validations/project'
import { generateProjectCode } from '@/lib/utils'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const projects = await prisma.project.findMany({
            where: { userId: profile.id },
            include: {
                client: { select: { id: true, name: true, company: true } },
                _count: { select: { milestones: true, invoices: true, revisions: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(projects)
    } catch (error) {
        console.error('Projects GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const profile = await prisma.user.findUnique({ where: { supabaseId: user.id } })
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

        const body = await request.json()
        const validated = projectSchema.parse(body)

        const client = await prisma.client.findUnique({
            where: { id: validated.clientId, userId: profile.id }
        })
        if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

        // Generate unique project code
        let code = generateProjectCode()
        while (await prisma.project.findUnique({ where: { code } })) {
            code = generateProjectCode()
        }

        const project = await prisma.project.create({
            data: {
                userId: profile.id,
                clientId: validated.clientId,
                code,
                name: validated.name,
                description: validated.description || null,
                projectType: validated.projectType,
                totalAmount: validated.totalAmount,
                currency: validated.currency,
                startDate: validated.startDate ? new Date(validated.startDate) : null,
                endDate: validated.endDate ? new Date(validated.endDate) : null,
                revisionsCap: validated.revisionsCap,
                extraRevisionFee: validated.extraRevisionFee,
                status: 'draft',
            },
        })

        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        console.error('Projects POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
