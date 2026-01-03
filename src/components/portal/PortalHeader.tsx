"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut, ChevronDown } from 'lucide-react'

interface PortalHeaderProps {
    clientName: string
    freelancerName: string
}

export default function PortalHeader({ clientName, freelancerName }: PortalHeaderProps) {
    const router = useRouter()
    const [showMenu, setShowMenu] = useState(false)

    const handleLogout = async () => {
        await fetch('/api/portal/logout', { method: 'POST' })
        router.push('/portal/login')
    }

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <Link href="/portal" className="text-xl font-bold text-gray-900">
                            Client Portal
                        </Link>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600">{freelancerName}</span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                        >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{clientName}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
