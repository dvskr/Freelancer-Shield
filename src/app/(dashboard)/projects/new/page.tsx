import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import ProjectForm from '@/components/projects/ProjectForm'

export const metadata = { title: 'New Project | FreelancerShield' }

interface NewProjectPageProps {
    searchParams: Promise<{ clientId?: string }>
}

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
    const { profile } = await requireAuth()
    const params = await searchParams

    const clients = await prisma.client.findMany({
        where: { userId: profile.id },
        select: { id: true, name: true, company: true },
        orderBy: { name: 'asc' },
    })

    if (clients.length === 0) {
        redirect('/clients/new?from=projects')
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <Link href="/projects" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">New Project</h1>
                <p className="text-gray-600 mt-1">Create a new project with revision limits and pricing.</p>
            </div>
            <ProjectForm clients={clients} mode="create" preselectedClientId={params.clientId} />
        </div>
    )
}
