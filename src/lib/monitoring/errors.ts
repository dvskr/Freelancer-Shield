/**
 * Error monitoring and tracking utilities
 * 
 * This provides a centralized way to track errors throughout the application.
 * In development, errors are logged to console.
 * In production, this can be extended to send to Sentry, LogRocket, etc.
 */

const isDev = process.env.NODE_ENV === 'development'

interface ErrorContext {
    userId?: string
    action?: string
    metadata?: Record<string, unknown>
}

/**
 * Track an error with optional context
 */
export function captureException(error: Error | unknown, context?: ErrorContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error))

    if (isDev) {
        console.error('[ERROR]', errorObj.message, context)
        console.error(errorObj.stack)
    } else {
        // In production, send to error tracking service
        // Example with Sentry:
        // Sentry.captureException(errorObj, { extra: context })

        // For now, still log in production but could be sent to logging service
        console.error('[PROD ERROR]', {
            message: errorObj.message,
            stack: errorObj.stack,
            ...context,
        })
    }
}

/**
 * Track a message/event (not an error)
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (isDev) {
        const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log
        logFn(`[${level.toUpperCase()}]`, message)
    } else {
        // In production, send to error tracking service
        // Sentry.captureMessage(message, level)
        console.log(`[PROD ${level.toUpperCase()}]`, message)
    }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; name?: string } | null): void {
    if (isDev) {
        console.log('[User Context]', user)
    } else {
        // Sentry.setUser(user)
    }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
    category: string
    message: string
    level?: 'info' | 'warning' | 'error'
    data?: Record<string, unknown>
}): void {
    if (isDev) {
        console.log('[Breadcrumb]', breadcrumb.category, breadcrumb.message, breadcrumb.data)
    } else {
        // Sentry.addBreadcrumb({
        //     category: breadcrumb.category,
        //     message: breadcrumb.message,
        //     level: breadcrumb.level || 'info',
        //     data: breadcrumb.data,
        // })
    }
}

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    context?: ErrorContext
): T {
    return (async (...args: Parameters<T>) => {
        try {
            return await fn(...args)
        } catch (error) {
            captureException(error, context)
            throw error
        }
    }) as T
}
