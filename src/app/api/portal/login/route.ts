import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { portalLoginSchema } from '@/lib/validations/portal'
import { sendEmail } from '@/lib/email/resend'
import { portalLoginEmailHtml, portalLoginEmailText } from '@/lib/email/templates/portal-login'
import { rateLimit } from '@/lib/security/rate-limit'

function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
}

export async function GET() {
    return NextResponse.json({ status: 'Portal login endpoint' })
}

export async function POST(request: NextRequest) {
    // Apply strict rate limiting for auth endpoints (5 requests per minute)
    const rateLimitResult = await rateLimit(request, 'auth')
    if (rateLimitResult) {
        return rateLimitResult
    }

    try {
        const body = await request.json()
        const validation = portalLoginSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 })
        }

        const { email, redirectTo } = validation.data

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

        // Always return success to prevent email enumeration
        if (!client) {
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

        // Build login URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const loginUrl = `${baseUrl}/portal/login?token=${token}${redirectTo ? `&redirect=${redirectTo}` : ''}`

        // Get freelancer display name
        const freelancerName = client.user.businessName ||
            `${client.user.firstName || ''} ${client.user.lastName || ''}`.trim() ||
            'Your Freelancer'

        // Send the magic link email
        const emailResult = await sendEmail({
            to: client.email,
            subject: `Your Portal Access Link - ${freelancerName}`,
            html: portalLoginEmailHtml({
                clientName: client.name,
                freelancerName,
                loginUrl,
                expiresIn: '24 hours',
            }),
            text: portalLoginEmailText({
                clientName: client.name,
                freelancerName,
                loginUrl,
                expiresIn: '24 hours',
            }),
        })

        if (!emailResult.success) {
            // Log error but don't expose to client (security)
            console.error('Failed to send portal login email:', emailResult.error)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Portal login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
