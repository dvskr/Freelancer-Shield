import { cn } from '@/lib/utils'
import { CSSProperties } from 'react'

interface SkeletonProps {
    className?: string
    style?: CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
    return (
        <div className={cn('animate-pulse rounded-md bg-gray-200', className)} style={style} />
    )
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')} />
            ))}
        </div>
    )
}

export function SkeletonCard({ className }: SkeletonProps) {
    return (
        <div className={cn('bg-white rounded-xl border border-gray-200 p-6', className)}>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <SkeletonText lines={3} />
        </div>
    )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 p-4">
                <div className="flex gap-4">
                    {[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="h-4 flex-1" />))}
                </div>
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="border-b border-gray-100 p-4">
                    <div className="flex gap-4">
                        {[1, 2, 3, 4].map((j) => (<Skeleton key={j} className="h-4 flex-1" />))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export function SkeletonKPICards() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <Skeleton className="w-12 h-4" />
                    </div>
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-8 w-24" />
                </div>
            ))}
        </div>
    )
}

export function SkeletonChart() {
    const heights = [45, 65, 35, 80, 55, 70, 40, 60, 75, 50, 85, 30] // Fixed heights for SSR
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Skeleton className="h-5 w-40 mb-6" />
            <div className="h-64 flex items-end gap-2">
                {heights.map((height, i) => (
                    <Skeleton key={i} className="flex-1" style={{ height: `${height}%` }} />
                ))}
            </div>
        </div>
    )
}

export function SkeletonList({ items = 5 }: { items?: number }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            ))}
        </div>
    )
}
