// Sanitize plain text (remove all HTML)
export function sanitizeText(input: string): string {
    return input.replace(/<[^>]*>/g, '').trim()
}

// Sanitize object recursively
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result = { ...obj }

    for (const key in result) {
        const value = result[key]

        if (typeof value === 'string') {
            (result as Record<string, unknown>)[key] = sanitizeText(value)
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            (result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>)
        } else if (Array.isArray(value)) {
            (result as Record<string, unknown>)[key] = value.map((item) =>
                typeof item === 'string' ? sanitizeText(item) : typeof item === 'object' ? sanitizeObject(item as Record<string, unknown>) : item
            )
        }
    }

    return result
}

// Validate and sanitize email
export function sanitizeEmail(email: string): string | null {
    const cleaned = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(cleaned) ? cleaned : null
}

// Sanitize URL
export function sanitizeUrl(url: string): string | null {
    try {
        const parsed = new URL(url)
        if (!['http:', 'https:'].includes(parsed.protocol)) return null
        return parsed.toString()
    } catch {
        return null
    }
}
