/**
 * This is a helper middleware that wraps API route handlers with:
 * 1. Rate limiting (configurable type)
 * 2. Error logging via production-safe logger
 * 3. Standard error response formatting
 * 
 * Usage:
 * export const POST = withApiHandler(async (request) => { ... }, { rateLimit: 'standard' })
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RateLimitType } from '@/lib/security/rate-limit'
import logger from '@/lib/logger'

interface ApiHandlerOptions {
    rateLimit?: RateLimitType | false
    handlerName?: string
}

type ApiHandler = (request: NextRequest, context?: unknown) => Promise<NextResponse>

export function withApiHandler(
    handler: ApiHandler,
    options: ApiHandlerOptions = {}
): ApiHandler {
    return async (request: NextRequest, context?: unknown) => {
        // Apply rate limiting if specified
        if (options.rateLimit !== false) {
            const rateLimitType = options.rateLimit || 'standard'
            const rateLimitResult = await rateLimit(request, rateLimitType)
            if (rateLimitResult) return rateLimitResult
        }

        try {
            return await handler(request, context)
        } catch (error) {
            const name = options.handlerName || request.nextUrl.pathname
            logger.error(`API Handler Error [${name}]:`, error)

            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    }
}

/**
 * Standard API error response
 */
export function apiError(message: string, status: number = 400): NextResponse {
    return NextResponse.json({ error: message }, { status })
}

/**
 * Standard API success response
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status })
}
