"use client"

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
    fallback?: string
}

export function OptimizedImage({ className, fallback = '/placeholder.png', alt, ...props }: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    return (
        <div className={cn('relative overflow-hidden', className)}>
            <Image
                {...props}
                alt={alt}
                src={error ? fallback : props.src}
                className={cn('duration-300 ease-in-out', isLoading ? 'scale-110 blur-lg' : 'scale-100 blur-0')}
                onLoad={() => setIsLoading(false)}
                onError={() => setError(true)}
            />
        </div>
    )
}
