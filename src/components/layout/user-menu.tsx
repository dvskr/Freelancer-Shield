"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
    Settings,
    LayoutDashboard,
    LogOut,
    ChevronDown,
    Users,
    FolderKanban,
    FileText,
    CreditCard
} from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface UserMenuProps {
    user: {
        email: string
        firstName?: string | null
        lastName?: string | null
        businessName?: string | null
        avatarUrl?: string | null
    }
}

export default function UserMenu({ user }: UserMenuProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    const displayName = user.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user.email

    const initials = user.firstName
        ? getInitials(`${user.firstName} ${user.lastName || ''}`)
        : user.email[0].toUpperCase()

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                {user.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                        {initials}
                    </div>
                )}
                <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[150px] truncate">
                    {displayName}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {user.businessName && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">{user.businessName}</p>
                        )}
                    </div>

                    <div className="py-1">
                        <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>

                        <Link
                            href="/clients"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <Users className="w-4 h-4" />
                            Clients
                        </Link>

                        <Link
                            href="/projects"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <FolderKanban className="w-4 h-4" />
                            Projects
                        </Link>

                        <Link
                            href="/invoices"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <FileText className="w-4 h-4" />
                            Invoices
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                        <Link
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>

                        <Link
                            href="/settings/billing"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <CreditCard className="w-4 h-4" />
                            Billing
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
