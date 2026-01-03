import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import MilestoneForm from '@/components/milestones/MilestoneForm'

interface EditMilestonePageProps {
    params: Promise<{ id: string; milestoneId: string }>
}

export const metadata = {
    title: 'Edit Milestone | FreelancerShield',
}

export default async function EditMilestonePage({ params }: EditMilestonePageProps) {
    const { profile } = await requireAuth()
    const { id, milestoneId } = await params

    const project = await prisma.project.findUnique({
        where: { id, userId: profile.id },
        include: {
            milestones: {
                select: { id: true, amount: true },
            },
        },
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

    const otherMilestonesTotal = project.milestones
        .filter(m => m.id !== milestone.id)
        .reduce((sum, m) => sum + m.amount, 0)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Link
                    href={`/projects/${id}/milestones/${milestone.id}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Milestone
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Milestone</h1>
                <p className="text-gray-600 mt-1">
                    Update {milestone.name}
                </p>
            </div>

            <MilestoneForm
                projectId={id}
                mode="edit"
                initialData={{
                    id: milestone.id,
                    name: milestone.name,
                    description: milestone.description || '',
                    amount: milestone.amount,
                    dueDate: milestone.dueDate ? milestone.dueDate.toISOString().split('T')[0] : '',
                }}
                existingMilestonesTotal={otherMilestonesTotal}
                projectTotal={project.totalAmount}
            />
        </div>
    )
}
