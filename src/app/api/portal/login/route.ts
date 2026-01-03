import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
}

export async function GET() {
    return NextResponse.json({ status: 'Portal login endpoint' })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, redirectTo } = body

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const client = await prisma.client.findFirst({
            where: { email: email.toLowerCase() },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        businessName: true,
                    },
                },
            },
        })

        if (!client) {
            // Don't reveal if email exists
            return NextResponse.json({ success: true })
        }

        const token = generateSecureToken()
        const expiry = new Date()
        expiry.setHours(expiry.getHours() + 24)

        await prisma.client.update({
            where: { id: client.id },
            data: {
                portalEnabled: true,
                portalToken: token,
                portalTokenExp: expiry,
            },
        })

        // For now, log the token (email functionality can be added later)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const loginUrl = `${baseUrl}/portal/login?token=${token}${redirectTo ? `&redirect=${redirectTo}` : ''}`

        console.log('Portal login URL for', client.email + ':', loginUrl)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Portal login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
