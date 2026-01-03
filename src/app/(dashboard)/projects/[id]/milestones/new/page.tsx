import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import MilestoneForm from '@/components/milestones/MilestoneForm'

interface NewMilestonePageProps {
    params: Promise<{ id: string }>
}

export const metadata = {
    title: 'New Milestone | FreelancerShield',
}

export default async function NewMilestonePage({ params }: NewMilestonePageProps) {
    const { profile } = await requireAuth()
    const { id } = await params

    const project = await prisma.project.findUnique({
        where: { id, userId: profile.id },
        include: {
            milestones: {
                select: { amount: true },
            },
        },
    })

    if (!project) {
        notFound()
    }

    const existingMilestonesTotal = project.milestones.reduce((sum, m) => sum + m.amount, 0)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Link
                    href={`/projects/${id}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {project.name}
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">New Milestone</h1>
                <p className="text-gray-600 mt-1">
                    Add a milestone to track progress and payments.
                </p>
            </div>

            <MilestoneForm
                projectId={id}
                mode="create"
                existingMilestonesTotal={existingMilestonesTotal}
                projectTotal={project.totalAmount}
            />
        </div>
    )
}
