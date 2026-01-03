import { requireAuth } from '@/lib/auth'
import ProjectHealth from '@/components/analytics/ProjectHealth'

export const metadata = { title: 'Project Health | FreelancerShield' }

export default async function ProjectHealthPage() {
    await requireAuth()
    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-gray-900">Project Health</h1><p className="text-gray-600 mt-1">Monitor project progress and identify risks</p></div>
            <ProjectHealth />
        </div>
    )
}
