import { requirePortalAuth } from '@/lib/portal/protect'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { FolderKanban, ArrowRight } from 'lucide-react'

export const metadata = {
    title: 'Projects | Client Portal',
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100)
}

export default async function PortalProjectsPage() {
    const { client } = await requirePortalAuth()

    const projects = await prisma.project.findMany({
        where: { clientId: client.id },
        include: {
            milestones: {
                select: { id: true, status: true, amount: true },
            },
        },
        orderBy: { updatedAt: 'desc' },
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700'
            case 'completed':
                return 'bg-blue-100 text-blue-700'
            case 'on_hold':
                return 'bg-yellow-100 text-yellow-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="text-gray-600 mt-1">Track your project progress</p>
            </div>

            {projects.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-500">Your projects will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {projects.map((project) => {
                        const totalMilestones = project.milestones.length
                        const completedMilestones = project.milestones.filter(
                            m => m.status === 'approved' || m.status === 'paid'
                        ).length
                        const progress = totalMilestones > 0
                            ? Math.round((completedMilestones / totalMilestones) * 100)
                            : 0
                        const totalBudget = project.milestones.reduce((sum, m) => sum + m.amount, 0)

                        return (
                            <Link
                                key={project.id}
                                href={`/portal/projects/${project.id}`}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                        {project.description && (
                                            <p className="text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                                        )}
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                        {project.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-gray-500">Progress</span>
                                        <span className="font-medium text-gray-900">{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-500">
                                            {completedMilestones} of {totalMilestones} milestones
                                        </span>
                                        {totalBudget > 0 && (
                                            <span className="text-gray-500">
                                                Budget: {formatCurrency(totalBudget)}
                                            </span>
                                        )}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
