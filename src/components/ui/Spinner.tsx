import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

export function Spinner({ size = 'md', className }: SpinnerProps) {
    return <Loader2 className={cn('animate-spin text-gray-400', sizes[size], className)} />
}

export function FullPageSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Spinner size="lg" />
        </div>
    )
}

export function InlineSpinner({ text }: { text?: string }) {
    return (
        <div className="flex items-center justify-center gap-2 p-4 text-gray-500">
            <Spinner size="sm" />
            {text && <span className="text-sm">{text}</span>}
        </div>
    )
}
