import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'outline' | 'flat'
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        const variants = {
            default: 'bg-white rounded-2xl shadow-sm border border-[var(--border)]',
            glass: 'glass-card rounded-2xl',
            outline: 'bg-transparent border border-[var(--border)] rounded-2xl',
            flat: 'bg-[var(--background-tertiary)] rounded-2xl border-none',
        }

        const paddings = {
            none: 'p-0',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        }

        return (
            <div
                ref={ref}
                className={cn(
                    variants[variant],
                    paddings[padding],
                    'transition-all duration-200 hover:shadow-md',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={cn('font-semibold leading-none tracking-tight text-[var(--foreground)]', className)} {...props}>
            {children}
        </h3>
    )
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cn('text-sm text-[var(--foreground-muted)]', className)} {...props}>
            {children}
        </p>
    )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('pt-0', className)} {...props}>{children}</div>
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex items-center pt-4 mt-4 border-t border-[var(--border)]', className)} {...props}>
            {children}
        </div>
    )
}

export { Card }
