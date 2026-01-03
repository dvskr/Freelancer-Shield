"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Building2, FileText, Bell, Shield, Database } from 'lucide-react'

const settingsNav = [
    {
        title: 'Account',
        items: [
            { href: '/settings', label: 'Profile', icon: User },
            { href: '/settings/business', label: 'Business Info', icon: Building2 },
            { href: '/settings/security', label: 'Security', icon: Shield },
        ],
    },
    {
        title: 'Preferences',
        items: [
            { href: '/settings/invoices', label: 'Invoicing', icon: FileText },
            { href: '/settings/notifications', label: 'Notifications', icon: Bell },
        ],
    },
    {
        title: 'Data',
        items: [
            { href: '/settings/export', label: 'Export & Backup', icon: Database },
        ],
    },
]

export default function SettingsSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 flex-shrink-0">
            <div className="sticky top-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

                <nav className="space-y-6">
                    {settingsNav.map((section) => (
                        <div key={section.title}>
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                {section.title}
                            </h2>
                            <ul className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
                    ))}
                </nav>
            </div>
        </aside>
    )
}
