"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    FileText,
    FileSignature,
    Settings,
    HelpCircle,
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Contracts', href: '/contracts', icon: FileSignature },
]

const secondaryNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
]

export default function DashboardSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 flex-shrink-0 hidden lg:block p-4 sticky top-16 h-[calc(100vh-4rem)]">
            <div className="h-full flex flex-col bg-white rounded-2xl border border-[var(--border)] shadow-sm">
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                                )}
                                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                                {item.name}
                            </Link>
                        )
                    })}

                    <div className="pt-4 mt-4 border-t border-[var(--border)]">
                        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            System
                        </p>
                        {secondaryNavigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                                    )}
                                    <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </div>
        </aside>
    )
}
