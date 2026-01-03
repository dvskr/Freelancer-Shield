"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Users, FolderKanban, FileText, Clock, BarChart3, Settings, LogOut } from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/time', label: 'Time', icon: Clock },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
]

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    return (
        <>
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0b0c15]/80 backdrop-blur-md border-b border-[#1e293b] z-40 px-4 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">F</div>
                    <span className="font-heading font-bold text-xl tracking-tight text-white">Freelancer<span className="text-blue-500">Shield</span></span>
                </Link>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-400 hover:text-white transition-colors">
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {isOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />}

            <div className={`lg:hidden fixed top-16 right-0 bottom-0 w-72 bg-[#0b0c15] border-l border-[#1e293b] z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-400 hover:bg-white/[0.03] hover:text-white'}`}>
                                <item.icon className="w-5 h-5" />{item.label}
                            </Link>
                        )
                    })}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1e293b] bg-[#0b0c15]">
                    <form action="/api/auth/signout" method="POST">
                        <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                            <LogOut className="w-5 h-5" />Sign Out
                        </button>
                    </form>
                </div>
            </div>
            <div className="lg:hidden h-16" />
        </>
    )
}
