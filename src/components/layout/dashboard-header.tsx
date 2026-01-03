"use client"

import Link from 'next/link'
import { Shield, Bell } from 'lucide-react'
import UserMenu from './user-menu'

interface DashboardHeaderProps {
    user: {
        email: string
        firstName?: string | null
        lastName?: string | null
        businessName?: string | null
        avatarUrl?: string | null
    }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-40 w-full glass">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/dashboard" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
                        <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-sm">
                            <Shield className="w-5 h-5 text-white fill-white/20" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                            FreelancerShield
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button className="relative p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-2" />
                        <UserMenu user={user} />
                    </div>
                </div>
            </div>
        </header>
    )
}
