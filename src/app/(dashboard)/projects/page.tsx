import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { Plus, FolderKanban, RotateCcw } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate, formatCurrency } from '@/lib/utils'
import ProjectFilters from '@/components/projects/ProjectFilters'

export const metadata = {
    title: 'Projects | FreelancerShield',
}

interface ProjectsPageProps {
    searchParams: Promise<{ q?: string; status?: string; clientId?: string }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
    const { profile } = await requireAuth()
    const params = await searchParams
    const searchQuery = params.q || ''
    const status = params.status || ''
    const clientId = params.clientId || ''

    const projects = await prisma.project.findMany({
        where: {
            userId: profile.id,
            ...(searchQuery && {
                OR: [
                    { name: { contains: searchQuery, mode: 'insensitive' } },
                    { code: { contains: searchQuery, mode: 'insensitive' } },
                ],
            }),
            ...(status && status !== 'all' && { status }),
            ...(clientId && { clientId }),
        },
        include: {
            client: { select: { id: true, name: true, company: true } },
            _count: { select: { milestones: true, invoices: true, revisions: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    const clients = await prisma.client.findMany({
        where: { userId: profile.id },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        totalValue: projects.reduce((sum, p) => sum + p.totalAmount, 0),
    }

    const getStatusColor = (projectStatus: string) => {
        switch (projectStatus) {
            case 'active': return 'bg-green-100 text-green-700'
            case 'completed': return 'bg-blue-100 text-blue-700'
            case 'on_hold': return 'bg-yellow-100 text-yellow-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-600 mt-1">Manage your projects and track progress</p>
                </div>
                <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                </div>
            </div>

            <ProjectFilters clients={clients} initialFilters={{ q: searchQuery, status: status || 'all', clientId }} />

            {projects.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <FolderKanban className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-500 mb-6">Create your first project to start tracking work.</p>
                    <Link href="/projects/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        <Plus className="w-5 h-5" />
                        Create Your First Project
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Project</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Revisions</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Value</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <Link href={`/projects/${project.id}`}>
                                            <p className="font-medium text-gray-900 hover:text-blue-600">{project.name}</p>
                                            <p className="text-sm text-gray-500">{project.code}</p>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/clients/${project.client.id}`} className="text-gray-700 hover:text-blue-600">
                                            {project.client.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <RotateCcw className="w-4 h-4 text-gray-400" />
                                            <span className={`text-sm ${project.revisionsUsed >= project.revisionsCap ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                                                {project.revisionsUsed} / {project.revisionsCap}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-900">{formatCurrency(project.totalAmount)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(project.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
