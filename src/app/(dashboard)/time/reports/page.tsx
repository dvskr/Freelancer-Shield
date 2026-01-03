import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TimeReports from '@/components/time/TimeReports'

export const metadata = {
    title: 'Time Reports | FreelancerShield',
}

export default async function TimeReportsPage() {
    await requireAuth()

    return (
        <div className="space-y-6">
            <div>
                <Link href="/time" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft className="w-4 h-4" />Back to Time Tracking
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Time Reports</h1>
                <p className="text-gray-600 mt-1">Analyze your time tracking data</p>
            </div>

            <TimeReports />
        </div>
    )
}
