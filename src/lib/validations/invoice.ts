import { z } from 'zod'

export const invoiceItemSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Price must be positive'),
    milestoneId: z.string().optional().nullable(),
})

export const invoiceSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    projectId: z.string().optional().nullable(),
    dueDate: z.string().min(1, 'Due date is required'),
    notes: z.string().optional(),
    taxRate: z.number().min(0).max(100).default(0),
    discountAmount: z.number().min(0).default(0),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>

export const invoiceUpdateSchema = z.object({
    status: z.enum(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled']).optional(),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
    taxRate: z.number().optional(),
    discountAmount: z.number().optional(),
})

export type InvoiceUpdateData = z.infer<typeof invoiceUpdateSchema>
