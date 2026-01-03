import { requirePortalAuth } from '@/lib/portal/protect'
import prisma from '@/lib/prisma'
import { CheckSquare } from 'lucide-react'
import MilestoneApprovalCard from '@/components/portal/MilestoneApprovalCard'

export const metadata = {
    title: 'Approvals | Client Portal',
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100)
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date))
}

export default async function PortalApprovalsPage() {
    const { client } = await requirePortalAuth()

    const pendingMilestones = await prisma.milestone.findMany({
        where: {
            project: { clientId: client.id },
            status: 'pending_approval',
        },
        include: {
            project: { select: { id: true, name: true } },
            deliverables: true,
        },
        orderBy: { updatedAt: 'desc' },
    })

    const recentlyApproved = await prisma.milestone.findMany({
        where: {
            project: { clientId: client.id },
            status: { in: ['approved', 'paid'] },
            approvedAt: { not: null },
        },
        include: {
            project: { select: { id: true, name: true } },
        },
        orderBy: { approvedAt: 'desc' },
        take: 5,
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
                <p className="text-gray-600 mt-1">Review and approve completed milestones</p>
            </div>

            {/* Pending Approvals */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Pending Your Approval ({pendingMilestones.length})
                </h2>

                {pendingMilestones.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <CheckSquare className="w-12 h-12 text-green-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                        <p className="text-gray-500">No milestones waiting for your approval.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingMilestones.map((milestone) => (
                            <MilestoneApprovalCard
                                key={milestone.id}
                                milestone={milestone}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Recently Approved */}
            {recentlyApproved.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Approved</h2>
                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                        {recentlyApproved.map((milestone) => (
                            <div key={milestone.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{milestone.name}</p>
                                    <p className="text-sm text-gray-500">{milestone.project.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{formatCurrency(milestone.amount)}</p>
                                    <p className="text-sm text-gray-500">
                                        Approved {formatDate(milestone.approvedAt!)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
