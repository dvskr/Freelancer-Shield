import { z } from 'zod'

// Invoice Payment
export const invoicePaymentSchema = z.object({
    amount: z.number().min(1, 'Amount must be greater than 0'),
    method: z.enum(['stripe', 'cash', 'check', 'bank_transfer', 'other']),
    notes: z.string().max(500).optional(),
    paidAt: z.string().optional(),
})

export type InvoicePaymentInput = z.infer<typeof invoicePaymentSchema>

// Invoice Reminder
export const invoiceReminderSchema = z.object({
    type: z.enum(['reminder', 'overdue', 'final']).optional(),
    message: z.string().max(2000).optional(),
    sendEmail: z.boolean().optional(),
})

export type InvoiceReminderInput = z.infer<typeof invoiceReminderSchema>

// Time Entry Invoice
export const timeEntryInvoiceSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    projectId: z.string().optional().nullable(),
    timeEntryIds: z.array(z.string()).min(1, 'At least one time entry is required'),
    hourlyRate: z.number().min(0).optional(),
    notes: z.string().max(1000).optional(),
})

export type TimeEntryInvoiceInput = z.infer<typeof timeEntryInvoiceSchema>

// Deliverables
export const deliverableSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().max(1000).optional(),
    fileUrl: z.string().url().optional().nullable(),
    fileType: z.string().max(50).optional(),
    fileSize: z.number().optional(),
    status: z.enum(['pending', 'uploaded', 'approved', 'rejected']).optional(),
})

export type DeliverableInput = z.infer<typeof deliverableSchema>

export const deliverableUpdateSchema = deliverableSchema.partial()

export type DeliverableUpdateInput = z.infer<typeof deliverableUpdateSchema>

// Milestone Reorder
export const milestoneReorderSchema = z.object({
    milestoneIds: z.array(z.string()).min(1, 'At least one milestone is required'),
})

export type MilestoneReorderInput = z.infer<typeof milestoneReorderSchema>

// Project Revision
export const projectRevisionSchema = z.object({
    description: z.string().min(1, 'Description is required').max(2000),
    milestoneId: z.string().optional().nullable(),
    requestedBy: z.enum(['client', 'freelancer']).optional(),
})

export type ProjectRevisionInput = z.infer<typeof projectRevisionSchema>

// Client Message
export const clientMessageSchema = z.object({
    message: z.string().min(1, 'Message is required').max(5000),
    projectId: z.string().optional().nullable(),
    milestoneId: z.string().optional().nullable(),
})

export type ClientMessageInput = z.infer<typeof clientMessageSchema>

// Auth Profile
export const authProfileSchema = z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    businessName: z.string().max(200).optional(),
    phone: z.string().max(20).optional(),
    timezone: z.string().max(50).optional(),
    currency: z.string().max(3).optional(),
})

export type AuthProfileInput = z.infer<typeof authProfileSchema>
