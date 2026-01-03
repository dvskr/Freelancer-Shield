"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { invoiceSchema, InvoiceFormData } from '@/lib/validations/invoice'
import {
    FileText,
    Users,
    FolderKanban,
    Calendar,
    DollarSign,
    Plus,
    Trash2,
    Loader2,
    AlertCircle,
    Receipt,
    Percent
} from 'lucide-react'
import { dollarsToCents, centsToDollars, formatCurrency } from '@/lib/utils'

interface Client {
    id: string
    name: string
    company: string | null
}

interface Project {
    id: string
    name: string
    clientId: string
    milestones: {
        id: string
        name: string
        amount: number
        status: string
    }[]
}

interface InvoiceFormProps {
    clients: Client[]
    projects: Project[]
    preselectedClientId?: string
    preselectedProjectId?: string
    nextInvoiceNumber: string
}

export default function InvoiceForm({
    clients,
    projects,
    preselectedClientId,
    preselectedProjectId,
    nextInvoiceNumber,
}: InvoiceFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Default due date: 14 days from now
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 14)

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            clientId: preselectedClientId || '',
            projectId: preselectedProjectId || null,
            dueDate: defaultDueDate.toISOString().split('T')[0],
            notes: '',
            taxRate: 0,
            discountAmount: 0,
            items: [{ description: '', quantity: 1, unitPrice: 0, milestoneId: null }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    })

    const selectedClientId = watch('clientId')
    const selectedProjectId = watch('projectId')
    const items = watch('items')
    const taxRate = watch('taxRate')
    const discountAmount = watch('discountAmount')

    // Filter projects by selected client
    const filteredProjects = projects.filter(p => p.clientId === selectedClientId)

    // Get milestones for selected project
    const selectedProject = projects.find(p => p.id === selectedProjectId)
    const availableMilestones = selectedProject?.milestones.filter(m =>
        m.status !== 'paid'
    ) || []

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice)
    }, 0)
    const taxAmount = Math.round(subtotal * (taxRate / 100))
    const total = subtotal + taxAmount - discountAmount

    // Add milestone as line item
    const addMilestoneItem = (milestone: typeof availableMilestones[0]) => {
        append({
            description: milestone.name,
            quantity: 1,
            unitPrice: milestone.amount,
            milestoneId: milestone.id,
        })
    }

    const onSubmit = async (data: InvoiceFormData) => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to create invoice')
            }

            const invoice = await res.json()
            router.push(`/invoices/${invoice.id}`)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Invoice Number Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">Invoice Number:</span>
                    <span className="text-blue-900 font-bold">{nextInvoiceNumber}</span>
                </div>
            </div>

            {/* Client & Project */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client *
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                {...register('clientId')}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white"
                            >
                                <option value="">Select a client</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}{client.company ? ` (${client.company})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.clientId && (
                            <p className="text-sm text-red-600 mt-1">{errors.clientId.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project (Optional)
                        </label>
                        <div className="relative">
                            <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                {...register('projectId')}
                                disabled={!selectedClientId}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100"
                            >
                                <option value="">No project</option>
                                {filteredProjects.map((project) => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Due Date */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date *
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                {...register('dueDate')}
                                type="date"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
                            />
                        </div>
                        {errors.dueDate && (
                            <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tax Rate (%)
                        </label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                {...register('taxRate', { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Discount
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={0}
                                onChange={(e) => setValue('discountAmount', dollarsToCents(e.target.value || '0'))}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Add Milestones */}
            {availableMilestones.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add from Milestones</h3>
                    <div className="flex flex-wrap gap-2">
                        {availableMilestones.map((milestone) => (
                            <button
                                key={milestone.id}
                                type="button"
                                onClick={() => addMilestoneItem(milestone)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                {milestone.name} ({formatCurrency(milestone.amount)})
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Line Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>

                <div className="space-y-4">
                    {/* Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                        <div className="col-span-5">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Unit Price</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Items */}
                    {fields.map((field, index) => {
                        const item = items[index]
                        const lineTotal = (item?.quantity || 0) * (item?.unitPrice || 0)

                        return (
                            <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
                                <div className="col-span-12 md:col-span-5">
                                    <input
                                        {...register(`items.${index}.description`)}
                                        type="text"
                                        placeholder="Description"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    {errors.items?.[index]?.description && (
                                        <p className="text-xs text-red-600 mt-1">{errors.items[index]?.description?.message}</p>
                                    )}
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <input
                                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                        type="number"
                                        min="1"
                                        placeholder="Qty"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            defaultValue={centsToDollars(field.unitPrice)}
                                            onChange={(e) => {
                                                const cents = dollarsToCents(e.target.value || '0')
                                                setValue(`items.${index}.unitPrice`, cents)
                                            }}
                                            className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-right"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-3 md:col-span-2 flex items-center justify-end">
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatCurrency(lineTotal)}
                                    </span>
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-gray-400 hover:text-red-600 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* Add Item Button */}
                    <button
                        type="button"
                        onClick={() => append({ description: '', quantity: 1, unitPrice: 0, milestoneId: null })}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Line Item
                    </button>

                    {errors.items && typeof errors.items === 'object' && 'message' in errors.items && (
                        <p className="text-sm text-red-600">{errors.items.message as string}</p>
                    )}
                </div>

                {/* Totals */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-end">
                        <div className="w-full md:w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                            </div>
                            {taxRate > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax ({taxRate}%)</span>
                                    <span className="text-gray-900">{formatCurrency(taxAmount)}</span>
                                </div>
                            )}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="text-red-600">-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    placeholder="Payment instructions, terms, or any additional notes..."
                />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Invoice'
                    )}
                </button>
            </div>
        </form>
    )
}
