"use client"

import { useState, useCallback } from 'react'

interface UploadResult {
    url: string
    path: string
    name: string
    size: number
    type: string
}

interface UseFileUploadOptions {
    folder?: string
    maxSize?: number
    allowedTypes?: string[]
    onSuccess?: (result: UploadResult) => void
    onError?: (error: string) => void
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
        setUploading(true)
        setError(null)
        setProgress(0)

        // Client-side validation
        const maxSize = options.maxSize || 10 * 1024 * 1024 // Default 10MB
        if (file.size > maxSize) {
            const err = `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`
            setError(err)
            options.onError?.(err)
            setUploading(false)
            return null
        }

        if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
            const err = 'File type not allowed'
            setError(err)
            options.onError?.(err)
            setUploading(false)
            return null
        }

        try {
            setProgress(10)

            const formData = new FormData()
            formData.append('file', file)
            if (options.folder) {
                formData.append('folder', options.folder)
            }

            setProgress(30)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            setProgress(80)

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            setProgress(100)
            options.onSuccess?.(data)
            return data
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Upload failed'
            setError(message)
            options.onError?.(message)
            return null
        } finally {
            setUploading(false)
        }
    }, [options])

    const reset = useCallback(() => {
        setError(null)
        setProgress(0)
    }, [])

    return { upload, uploading, progress, error, reset }
}
