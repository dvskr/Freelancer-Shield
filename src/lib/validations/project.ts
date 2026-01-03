import { z } from 'zod'

export const projectSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    name: z.string().min(1, 'Project name is required').max(200, 'Name too long'),
    description: z.string().optional().or(z.literal('')),
    projectType: z.enum(['fixed', 'hourly', 'retainer']).default('fixed'),
    totalAmount: z.number().min(0, 'Amount must be positive'),
    currency: z.string().default('USD'),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
    revisionsCap: z.number().min(0).max(99).default(3),
    extraRevisionFee: z.number().min(0).default(5000),
})

export type ProjectFormData = z.infer<typeof projectSchema>

export const projectUpdateSchema = projectSchema.partial().extend({
    status: z.enum(['draft', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
})

export type ProjectUpdateData = z.infer<typeof projectUpdateSchema>
