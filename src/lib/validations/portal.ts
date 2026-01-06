import { z } from 'zod'

// Portal Login
export const portalLoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    redirectTo: z.string().optional(),
})

export type PortalLoginInput = z.infer<typeof portalLoginSchema>

// Portal Message
export const portalMessageSchema = z.object({
    recipientId: z.string().optional(),
    projectId: z.string().optional(),
    milestoneId: z.string().optional(),
    message: z.string().min(1, 'Message is required').max(5000),
})

export type PortalMessageInput = z.infer<typeof portalMessageSchema>

// Milestone Revision Request
export const milestoneRevisionSchema = z.object({
    reason: z.string().min(1, 'Reason is required').max(2000),
    notes: z.string().max(5000).optional(),
})

export type MilestoneRevisionInput = z.infer<typeof milestoneRevisionSchema>
