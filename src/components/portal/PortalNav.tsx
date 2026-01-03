"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    FolderKanban,
    CheckSquare,
    MessageSquare
} from 'lucide-react'

const navItems = [
    { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portal/invoices', label: 'Invoices', icon: FileText },
    { href: '/portal/projects', label: 'Projects', icon: FolderKanban },
    { href: '/portal/approvals', label: 'Approvals', icon: CheckSquare },
    { href: '/portal/messages', label: 'Messages', icon: MessageSquare },
]

export default function PortalNav() {
    const pathname = usePathname()

    return (
        <nav className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/portal' && pathname.startsWith(item.href))

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </nav>
    )
}
