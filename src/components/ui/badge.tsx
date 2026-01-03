import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'purple'
    size?: 'sm' | 'md'
}

const badgeVariants = {
    default: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    destructive: 'bg-red-100 text-red-700 hover:bg-red-200',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    outline: 'text-gray-900 border border-gray-200 hover:bg-gray-100',
}

function Badge({ className, variant = 'default', size = 'sm', ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                badgeVariants[variant],
                size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
                className
            )}
            {...props}
        />
    )
}

export { Badge }
