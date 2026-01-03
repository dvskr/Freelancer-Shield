import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode
    error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, error, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white',
                        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
                        'placeholder:text-gray-400',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'transition-all duration-200 shadow-sm',
                        icon && 'pl-10',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    ref={ref}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#000000',
                    }}
                    {...props}
                />
            </div>
        )
    }
)
Input.displayName = 'Input'

export { Input }
