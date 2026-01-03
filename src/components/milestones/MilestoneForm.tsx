"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { milestoneSchema, MilestoneFormData } from '@/lib/validations/milestone'
import {
    FileCheck,
    DollarSign,
    Calendar,
    FileText,
    Loader2,
    AlertCircle
} from 'lucide-react'
import { dollarsToCents, centsToDollars } from '@/lib/utils'

interface MilestoneFormProps {
    projectId: string
    initialData?: MilestoneFormData & { id?: string }
    mode: 'create' | 'edit'
    existingMilestonesTotal?: number
    projectTotal?: number
}

export default function MilestoneForm({
    projectId,
    initialData,
    mode,
    existingMilestonesTotal = 0,
    projectTotal = 0
}: MilestoneFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<MilestoneFormData>({
        resolver: zodResolver(milestoneSchema),
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            amount: initialData?.amount || 0,
            dueDate: initialData?.dueDate || '',
        },
    })

    const currentAmount = watch('amount')
    const remainingBudget = projectTotal - existingMilestonesTotal - (mode === 'edit' ? (initialData?.amount || 0) : 0)

    const onSubmit = async (data: MilestoneFormData) => {
        setLoading(true)
        setError(null)

        try {
            const url = mode === 'create'
                ? `/api/projects/${projectId}/milestones`
                : `/api/projects/${projectId}/milestones/${initialData?.id}`

            const res = await fetch(url, {
                method: mode === 'create' ? 'POST' : 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to save milestone')
            }

            router.push(`/projects/${projectId}`)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cents = dollarsToCents(e.target.value || '0')
        setValue('amount', cents)
    }

    const suggestRemainingAmount = () => {
        setValue('amount', remainingBudget)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Budget Summary */}
            {projectTotal > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700">Project Total:</span>
                        <span className="font-medium text-blue-900">{centsToDollars(projectTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-blue-700">Already Allocated:</span>
                        <span className="font-medium text-blue-900">{centsToDollars(existingMilestonesTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1 pt-2 border-t border-blue-200">
                        <span className="text-blue-700">Remaining:</span>
                        <span className={`font-medium ${remainingBudget < 0 ? 'text-red-600' : 'text-blue-900'}`}>
                            {centsToDollars(remainingBudget)}
                        </span>
                    </div>
                </div>
            )}

            {/* Milestone Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestone Details</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Milestone Name *
                        </label>
                        <div className="relative">
                            <FileCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                {...register('name')}
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Design Mockups"
                            />
                        </div>
                        {errors.name && (
                            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describe what will be delivered in this milestone..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount *
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={centsToDollars(initialData?.amount || 0)}
                                    onChange={handleAmountChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            {remainingBudget > 0 && mode === 'create' && (
                                <button
                                    type="button"
                                    onClick={suggestRemainingAmount}
                                    className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                                >
                                    Use remaining budget ({centsToDollars(remainingBudget)})
                                </button>
                            )}
                            {errors.amount && (
                                <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('dueDate')}
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {mode === 'create' ? 'Creating...' : 'Saving...'}
                        </>
                    ) : (
                        mode === 'create' ? 'Create Milestone' : 'Save Changes'
                    )}
                </button>
            </div>
        </form>
    )
}
