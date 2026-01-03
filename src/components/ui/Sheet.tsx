"use client"

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
    open: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    side?: 'right' | 'bottom'
    className?: string
}

export function Sheet({ open, onClose, title, children, side = 'right', className }: SheetProps) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    if (!open) return null

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
            <div className={cn(
                'fixed z-50 bg-white',
                side === 'right' && 'top-0 right-0 bottom-0 w-full max-w-md animate-slide-in-right',
                side === 'bottom' && 'left-0 right-0 bottom-0 max-h-[90vh] rounded-t-2xl animate-slide-in-up',
                className
            )}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-lg text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>{children}</div>
            </div>
        </>
    )
}
