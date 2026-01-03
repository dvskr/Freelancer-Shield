"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, FileText, Clock, Menu } from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/time', label: 'Time', icon: Clock },
]

interface BottomNavProps {
    onMenuClick: () => void
}

export default function BottomNav({ onMenuClick }: BottomNavProps) {
    const pathname = usePathname()

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0b0c15] border-t border-[#1e293b] z-40 safe-area-pb backdrop-blur-lg bg-opacity-90">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
                            <item.icon className="w-5 h-5" />
                            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                        </Link>
                    )
                })}
                <button onClick={onMenuClick} className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-gray-300 transition-colors">
                    <Menu className="w-5 h-5" />
                    <span className="text-[10px] mt-1 font-medium">More</span>
                </button>
            </div>
        </nav>
    )
}
