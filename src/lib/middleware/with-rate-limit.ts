import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RateLimitType } from '@/lib/security/rate-limit'

/**
 * Higher-order function to wrap API route handlers with rate limiting
 * @param handler - The API route handler function
 * @param type - The type of rate limit to apply ('standard', 'auth', 'public')
 */
export function withRateLimit<T extends unknown[]>(
    handler: (req: NextRequest, ...args: T) => Promise<NextResponse>,
    type: RateLimitType = 'standard'
) {
    return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
        const rateLimitResult = await rateLimit(req, type)

        if (rateLimitResult) {
            return rateLimitResult // Returns 429 response
        }

        return handler(req, ...args)
    }
}

/**
 * Apply rate limiting to multiple handlers at once
 */
export function createRateLimitedRoute<T extends unknown[]>(
    handlers: {
        GET?: (req: NextRequest, ...args: T) => Promise<NextResponse>
        POST?: (req: NextRequest, ...args: T) => Promise<NextResponse>
        PUT?: (req: NextRequest, ...args: T) => Promise<NextResponse>
        PATCH?: (req: NextRequest, ...args: T) => Promise<NextResponse>
        DELETE?: (req: NextRequest, ...args: T) => Promise<NextResponse>
    },
    type: RateLimitType = 'standard'
) {
    const wrapped: Record<string, (req: NextRequest, ...args: T) => Promise<NextResponse>> = {}

    for (const [method, handler] of Object.entries(handlers)) {
        if (handler) {
            wrapped[method] = withRateLimit(handler, type)
        }
    }

    return wrapped
}
