import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import ProjectForm from '@/components/projects/ProjectForm'

interface EditProjectPageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditProjectPageProps) {
    const { id } = await params
    const project = await prisma.project.findUnique({
        where: { id },
        select: { name: true },
    })
    return { title: project ? `Edit ${project.name} | FreelancerShield` : 'Project Not Found' }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
    const { profile } = await requireAuth()
    const { id } = await params

    const project = await prisma.project.findUnique({
        where: { id, userId: profile.id },
        include: {
            client: { select: { id: true, name: true, company: true } },
        },
    })

    if (!project) {
        notFound()
    }

    const clients = await prisma.client.findMany({
        where: { userId: profile.id },
        select: { id: true, name: true, company: true },
        orderBy: { name: 'asc' },
    })

    // Format dates for the form
    const initialData = {
        id: project.id,
        clientId: project.clientId,
        name: project.name,
        description: project.description || '',
        projectType: project.projectType as 'fixed' | 'hourly' | 'retainer',
        totalAmount: project.totalAmount,
        currency: project.currency,
        startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : '',
        endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : '',
        revisionsCap: project.revisionsCap,
        extraRevisionFee: project.extraRevisionFee,
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {project.name}
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
                <p className="text-gray-600 mt-1">Update project details and settings.</p>
            </div>
            <ProjectForm clients={clients} initialData={initialData} mode="edit" />
        </div>
    )
}
