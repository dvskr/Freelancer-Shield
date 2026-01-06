import { NextRequest, NextResponse } from 'next/server'

export type RateLimitType = 'standard' | 'auth' | 'public'

interface RateLimitConfig {
    interval: number // in milliseconds
    limit: number
}

const RATE_LIMIT_CONFIGS: Record<RateLimitType, RateLimitConfig> = {
    // Standard API: 100 requests per minute
    standard: { interval: 60000, limit: 100 },
    // Auth endpoints: 5 requests per minute (strict)
    auth: { interval: 60000, limit: 5 },
    // Public endpoints: 20 requests per minute
    public: { interval: 60000, limit: 20 },
}

// In-memory store (works for single instance, use Redis for production at scale)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limit a request
 * @returns NextResponse with 429 if rate limited, null otherwise
 */
export async function rateLimit(
    request: NextRequest,
    type: RateLimitType = 'standard'
): Promise<NextResponse | null> {
    const config = RATE_LIMIT_CONFIGS[type]
    const ip = request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'anonymous'
    const key = `${type}:${ip}:${request.nextUrl.pathname}`
    const now = Date.now()

    const record = rateLimitStore.get(key)

    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + config.interval })
        return null
    }

    if (record.count >= config.limit) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000)
        return NextResponse.json(
            { error: 'Too many requests', code: 'RATE_LIMIT' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(retryAfter),
                    'X-RateLimit-Limit': String(config.limit),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(record.resetTime),
                }
            }
        )
    }

    record.count++
    return null
}

/**
 * Create a rate limiter with custom config
 */
export function createRateLimiter(config: RateLimitConfig) {
    return async function rateLimitMiddleware(request: NextRequest) {
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'anonymous'
        const key = `custom:${ip}:${request.nextUrl.pathname}`
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

// Clean up old entries periodically (only in Node.js environment)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now()
        for (const [key, value] of rateLimitStore.entries()) {
            if (now > value.resetTime) rateLimitStore.delete(key)
        }
    }, 60000)
}

