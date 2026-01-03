import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

const PORTAL_SESSION_COOKIE = 'portal_session'
const SESSION_DURATION_DAYS = 30
const ACCESS_TOKEN_DURATION_HOURS = 24

export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
}

export async function createPortalAccessToken(clientId: string): Promise<string> {
    const token = generateSecureToken()
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + ACCESS_TOKEN_DURATION_HOURS)

    await prisma.client.update({
        where: { id: clientId },
        data: {
            portalEnabled: true,
            portalToken: token,
            portalTokenExp: expiry,
        },
    })

    return token
}

export async function createPortalSession(
    clientId: string,
    userAgent?: string,
    ipAddress?: string
): Promise<string> {
    const token = generateSecureToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

    await prisma.portalSession.create({
        data: {
            clientId,
            token,
            expiresAt,
            userAgent,
            ipAddress,
        },
    })

    // Update last portal access
    await prisma.client.update({
        where: { id: clientId },
        data: { lastPortalAccess: new Date() },
    })

    return token
}

export async function validatePortalSession(token: string) {
    const session = await prisma.portalSession.findUnique({
        where: { token },
        include: {
            client: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            businessName: true,
                            email: true,
                        },
                    },
                },
            },
        },
    })

    if (!session) {
        return null
    }

    if (new Date() > session.expiresAt) {
        await prisma.portalSession.delete({ where: { id: session.id } })
        return null
    }

    // Update last used
    await prisma.portalSession.update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() },
    })

    return session
}

export async function validateAccessToken(token: string) {
    const client = await prisma.client.findFirst({
        where: {
            portalToken: token,
            portalEnabled: true,
            portalTokenExp: { gt: new Date() },
        },
    })

    return client
}

export async function getPortalSession() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(PORTAL_SESSION_COOKIE)?.value

    if (!sessionToken) {
        return null
    }

    return validatePortalSession(sessionToken)
}

export async function setPortalSessionCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set(PORTAL_SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
        path: '/portal',
    })
}

export async function clearPortalSession() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(PORTAL_SESSION_COOKIE)?.value

    if (sessionToken) {
        await prisma.portalSession.deleteMany({
            where: { token: sessionToken },
        })
    }

    cookieStore.delete(PORTAL_SESSION_COOKIE)
}

export async function revokeAllPortalSessions(clientId: string) {
    await prisma.portalSession.deleteMany({
        where: { clientId },
    })
}
