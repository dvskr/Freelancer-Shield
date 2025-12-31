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
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">FreelancerShield</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Bell className="w-5 h-5" />
                        </button>
                        <UserMenu user={user} />
                    </div>
                </div>
            </div>
        </header>
    )
}
