interface FetchOptions extends RequestInit {
    timeout?: number
}

export class FetchError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message)
        this.name = 'FetchError'
    }
}

export async function apiFetch<T = unknown>(
    url: string,
    options: FetchOptions = {}
): Promise<T> {
    const { timeout = 30000, ...fetchOptions } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...fetchOptions.headers,
            },
        })

        clearTimeout(timeoutId)

        const data = await response.json()

        if (!response.ok) {
            throw new FetchError(
                data.error || 'Request failed',
                response.status,
                data.code
            )
        }

        return data
    } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof FetchError) {
            throw error
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new FetchError('Request timeout', 408, 'TIMEOUT')
            }
            throw new FetchError(error.message, 500, 'NETWORK_ERROR')
        }

        throw new FetchError('Unknown error', 500, 'UNKNOWN')
    }
}

// Convenience methods
export const api = {
    get: <T>(url: string) => apiFetch<T>(url),

    post: <T>(url: string, data: unknown) =>
        apiFetch<T>(url, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    patch: <T>(url: string, data: unknown) =>
        apiFetch<T>(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    delete: <T>(url: string) =>
        apiFetch<T>(url, { method: 'DELETE' }),
}
