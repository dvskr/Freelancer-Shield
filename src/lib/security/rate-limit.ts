import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
    interval: number
    limit: number
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig = { interval: 60000, limit: 100 }) {
    return async function rateLimitMiddleware(request: NextRequest) {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous'
        const key = `${ip}:${request.nextUrl.pathname}`
        const now = Date.now()

        const record = rateLimitStore.get(key)

        if (!record || now > record.resetTime) {
            rateLimitStore.set(key, { count: 1, resetTime: now + config.interval })
            return null
        }

        if (record.count >= config.limit) {
            return NextResponse.json(
                { error: 'Too many requests', code: 'RATE_LIMIT' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)) } }
            )
        }

        record.count++
        return null
    }
}

// Clean up old entries periodically
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now()
        for (const [key, value] of rateLimitStore.entries()) {
            if (now > value.resetTime) rateLimitStore.delete(key)
        }
    }, 60000)
}
