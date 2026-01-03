import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import DeliverableForm from '@/components/deliverables/DeliverableForm'

interface NewDeliverablePageProps {
    params: Promise<{ id: string; milestoneId: string }>
}

export const metadata = {
    title: 'Add Deliverable | FreelancerShield',
}

export default async function NewDeliverablePage({ params }: NewDeliverablePageProps) {
    const { profile } = await requireAuth()
    const { id, milestoneId } = await params

    const project = await prisma.project.findUnique({
        where: { id, userId: profile.id },
    })

    if (!project) {
        notFound()
    }

    const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId, projectId: id },
    })

    if (!milestone) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Link
                    href={`/projects/${id}/milestones/${milestoneId}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {milestone.name}
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Add Deliverable</h1>
                <p className="text-gray-600 mt-1">
                    Upload a file or add a deliverable to this milestone.
                </p>
            </div>

            <DeliverableForm
                projectId={id}
                milestoneId={milestoneId}
            />
        </div>
    )
}
