"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    GripVertical,
    CheckCircle,
    Clock,
    CircleDot,
    FileCheck,
    ChevronUp,
    ChevronDown,
    Loader2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Milestone {
    id: string
    name: string
    amount: number
    status: string
    orderIndex: number
}

interface SortableMilestoneListProps {
    projectId: string
    milestones: Milestone[]
}

export default function SortableMilestoneList({
    projectId,
    milestones: initialMilestones
}: SortableMilestoneListProps) {
    const router = useRouter()
    const [milestones, setMilestones] = useState(initialMilestones)
    const [saving, setSaving] = useState(false)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
            case 'paid':
                return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'pending_approval':
                return <FileCheck className="w-4 h-4 text-yellow-600" />
            case 'in_progress':
                return <CircleDot className="w-4 h-4 text-blue-600" />
            default:
                return <Clock className="w-4 h-4 text-gray-400" />
        }
    }

    const moveUp = async (index: number) => {
        if (index === 0) return

        const newMilestones = [...milestones]
        const temp = newMilestones[index]
        newMilestones[index] = newMilestones[index - 1]
        newMilestones[index - 1] = temp

        setMilestones(newMilestones)
        await saveOrder(newMilestones)
    }

    const moveDown = async (index: number) => {
        if (index === milestones.length - 1) return

        const newMilestones = [...milestones]
        const temp = newMilestones[index]
        newMilestones[index] = newMilestones[index + 1]
        newMilestones[index + 1] = temp

        setMilestones(newMilestones)
        await saveOrder(newMilestones)
    }

    const saveOrder = async (orderedMilestones: Milestone[]) => {
        setSaving(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order: orderedMilestones.map((m, i) => ({ id: m.id, orderIndex: i })),
                }),
            })

            if (res.ok) {
                router.refresh()
            }
        } catch (err) {
            console.error('Failed to save order:', err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-2">
            {saving && (
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving order...
                </div>
            )}

            {milestones.map((milestone, index) => (
                <div
                    key={milestone.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                >
                    <GripVertical className="w-5 h-5 text-gray-300" />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0 || saving}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => moveDown(index)}
                            disabled={index === milestones.length - 1 || saving}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    {getStatusIcon(milestone.status)}

                    <div className="flex-1">
                        <Link
                            href={`/projects/${projectId}/milestones/${milestone.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                        >
                            {milestone.name}
                        </Link>
                    </div>

                    <span className="text-sm font-medium text-gray-600">
                        {formatCurrency(milestone.amount)}
                    </span>

                    <span className="text-xs text-gray-400 w-8 text-center">
                        #{index + 1}
                    </span>
                </div>
            ))}
        </div>
    )
}
