"use client"

import { useState, useEffect, useCallback } from 'react'
import { api, FetchError } from '@/lib/api/client'

interface UseDataOptions {
    enabled?: boolean
    refetchInterval?: number
    cacheTime?: number
}

interface UseDataResult<T> {
    data: T | null
    loading: boolean
    error: FetchError | null
    refetch: () => Promise<void>
}

const cache = new Map<string, { data: unknown; timestamp: number }>()

export function useData<T>(url: string, options: UseDataOptions = {}): UseDataResult<T> {
    const { enabled = true, refetchInterval, cacheTime = 5 * 60 * 1000 } = options

    const [data, setData] = useState<T | null>(() => {
        const cached = cache.get(url)
        if (cached && Date.now() - cached.timestamp < cacheTime) return cached.data as T
        return null
    })
    const [loading, setLoading] = useState(!data)
    const [error, setError] = useState<FetchError | null>(null)

    const fetchData = useCallback(async () => {
        if (!enabled) return
        setLoading(true)
        setError(null)
        try {
            const result = await api.get<T>(url)
            setData(result)
            cache.set(url, { data: result, timestamp: Date.now() })
        } catch (err) {
            setError(err instanceof FetchError ? err : new FetchError('Unknown error', 500))
        } finally {
            setLoading(false)
        }
    }, [url, enabled, cacheTime])

    useEffect(() => {
        fetchData()
        if (refetchInterval) {
            const interval = setInterval(fetchData, refetchInterval)
            return () => clearInterval(interval)
        }
    }, [fetchData, refetchInterval])

    return { data, loading, error, refetch: fetchData }
}

export function useMutation<T, V = unknown>(url: string, method: 'POST' | 'PATCH' | 'DELETE' = 'POST') {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<FetchError | null>(null)

    const mutate = useCallback(async (data?: V): Promise<T | null> => {
        setLoading(true)
        setError(null)
        try {
            let result: T
            switch (method) {
                case 'POST': result = await api.post<T>(url, data); break
                case 'PATCH': result = await api.patch<T>(url, data); break
                case 'DELETE': result = await api.delete<T>(url); break
            }
            cache.clear()
            return result
        } catch (err) {
            const fetchError = err instanceof FetchError ? err : new FetchError('Unknown error', 500)
            setError(fetchError)
            throw fetchError
        } finally {
            setLoading(false)
        }
    }, [url, method])

    return { mutate, loading, error }
}
