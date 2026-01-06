/**
 * Production-safe logger that only logs in development mode.
 * Use this instead of console.log throughout the codebase.
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
    /**
     * Log informational messages (only in development)
     */
    log: (...args: unknown[]): void => {
        if (isDev) {
            console.log('[LOG]', ...args)
        }
    },

    /**
     * Log debug messages (only in development)
     */
    debug: (...args: unknown[]): void => {
        if (isDev) {
            console.debug('[DEBUG]', ...args)
        }
    },

    /**
     * Log info messages (only in development)
     */
    info: (...args: unknown[]): void => {
        if (isDev) {
            console.info('[INFO]', ...args)
        }
    },

    /**
     * Log warning messages (always logs, even in production)
     */
    warn: (...args: unknown[]): void => {
        console.warn('[WARN]', ...args)
    },

    /**
     * Log error messages (always logs, even in production)
     * In production, this could be extended to send to error tracking service
     */
    error: (...args: unknown[]): void => {
        console.error('[ERROR]', ...args)

        // TODO: In production, send to error tracking service like Sentry
        // if (!isDev && typeof Sentry !== 'undefined') {
        //     Sentry.captureException(args[0])
        // }
    },

    /**
     * Log a table of data (only in development)
     */
    table: (data: unknown): void => {
        if (isDev) {
            console.table(data)
        }
    },

    /**
     * Create a grouped log section (only in development)
     */
    group: (label: string): void => {
        if (isDev) {
            console.group(label)
        }
    },

    groupEnd: (): void => {
        if (isDev) {
            console.groupEnd()
        }
    },
}

export default logger
