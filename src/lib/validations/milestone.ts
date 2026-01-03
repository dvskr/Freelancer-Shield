import { z } from 'zod'

export const milestoneSchema = z.object({
    name: z.string().min(1, 'Milestone name is required').max(200),
    description: z.string().optional().or(z.literal('')),
    amount: z.number().min(0, 'Amount must be positive'),
    dueDate: z.string().optional().or(z.literal('')),
})

export type MilestoneFormData = z.infer<typeof milestoneSchema>

export const milestoneUpdateSchema = milestoneSchema.partial().extend({
    status: z.enum(['pending', 'in_progress', 'pending_approval', 'approved', 'paid']).optional(),
    orderIndex: z.number().optional(),
})

export type MilestoneUpdateData = z.infer<typeof milestoneUpdateSchema>

export const deliverableSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().optional().or(z.literal('')),
    fileUrl: z.string().optional().or(z.literal('')),
    fileType: z.string().optional().or(z.literal('')),
    fileSize: z.number().optional(),
})

export type DeliverableFormData = z.infer<typeof deliverableSchema>
