"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, ProjectFormData } from '@/lib/validations/project'
import { FolderKanban, Users, DollarSign, RotateCcw, Loader2, AlertCircle } from 'lucide-react'
import { dollarsToCents, centsToDollars } from '@/lib/utils'

interface Client {
    id: string
    name: string
    company: string | null
}

interface ProjectFormProps {
    clients: Client[]
    initialData?: Partial<ProjectFormData> & { id?: string }
    mode: 'create' | 'edit'
    preselectedClientId?: string
}

export default function ProjectForm({ clients, initialData, mode, preselectedClientId }: ProjectFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            clientId: preselectedClientId || initialData?.clientId || '',
            name: initialData?.name || '',
            description: initialData?.description || '',
            projectType: initialData?.projectType || 'fixed',
            totalAmount: initialData?.totalAmount || 0,
            currency: initialData?.currency || 'USD',
            startDate: initialData?.startDate || '',
            endDate: initialData?.endDate || '',
            revisionsCap: initialData?.revisionsCap ?? 3,
            extraRevisionFee: initialData?.extraRevisionFee ?? 5000,
        },
    })

    const projectType = watch('projectType')
    const revisionsCap = watch('revisionsCap')
    const extraRevisionFeeValue = watch('extraRevisionFee')

    const onSubmit = async (data: ProjectFormData) => {
        setLoading(true)
        setError(null)

        try {
            const url = mode === 'create' ? '/api/projects' : `/api/projects/${initialData?.id}`
            const res = await fetch(url, {
                method: mode === 'create' ? 'POST' : 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to save project')
            }

            const project = await res.json()
            router.push(`/projects/${project.id}`)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue('totalAmount', dollarsToCents(e.target.value || '0'))
    }

    const handleRevisionFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue('extraRevisionFee', dollarsToCents(e.target.value || '0'))
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                {...register('clientId')}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                            >
                                <option value="">Select a client</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}{client.company ? ` (${client.company})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.clientId && <p className="text-sm text-red-600 mt-1">{errors.clientId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                        <div className="relative">
                            <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                {...register('name')}
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                                placeholder="Website Redesign"
                            />
                        </div>
                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                            placeholder="Describe the project scope..."
                        />
                    </div>
                </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                        <select
                            {...register('projectType')}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                        >
                            <option value="fixed">Fixed Price</option>
                            <option value="hourly">Hourly Rate</option>
                            <option value="retainer">Monthly Retainer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {projectType === 'hourly' ? 'Hourly Rate' : projectType === 'retainer' ? 'Monthly Rate' : 'Total Amount'} *
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={centsToDollars(initialData?.totalAmount || 0)}
                                onChange={handleAmountChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            {...register('startDate')}
                            type="date"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            {...register('endDate')}
                            type="date"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                        />
                    </div>
                </div>
            </div>

            {/* Revision Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Revision Settings</h3>
                <p className="text-gray-500 text-sm mb-4">Protect yourself from scope creep by setting revision limits.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Included Revisions</label>
                        <div className="relative">
                            <RotateCcw className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                {...register('revisionsCap', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                max="99"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Number of revisions included in the price</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Extra Revision Fee</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={centsToDollars(initialData?.extraRevisionFee || 5000)}
                                onChange={handleRevisionFeeChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                                placeholder="50.00"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Fee for each revision beyond the cap</p>
                    </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Summary:</strong> This project includes {revisionsCap} revision{revisionsCap !== 1 ? 's' : ''}.
                        Additional revisions will be billed at ${centsToDollars(extraRevisionFeeValue || 5000)} each.
                    </p>
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
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {mode === 'create' ? 'Creating...' : 'Saving...'}
                        </>
                    ) : (
                        mode === 'create' ? 'Create Project' : 'Save Changes'
                    )}
                </button>
            </div>
        </form>
    )
}
