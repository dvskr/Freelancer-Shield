import { z } from 'zod'

export const timeEntrySchema = z.object({
    description: z.string().min(1, 'Description is required').max(500),
    date: z.string().or(z.date()),
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
    duration: z.number().min(1, 'Duration must be at least 1 minute'),
    billable: z.boolean().default(true),
    hourlyRate: z.number().optional().nullable(),
    clientId: z.string().optional().nullable(),
    projectId: z.string().optional().nullable(),
    milestoneId: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
    notes: z.string().optional().nullable(),
})

export const timeEntryUpdateSchema = timeEntrySchema.partial()

export const timerStartSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    clientId: z.string().optional().nullable(),
    projectId: z.string().optional().nullable(),
    milestoneId: z.string().optional().nullable(),
    billable: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
})

export const timerStopSchema = z.object({
    description: z.string().optional(),
    notes: z.string().optional().nullable(),
})

export type TimeEntryInput = z.infer<typeof timeEntrySchema>
export type TimeEntryUpdate = z.infer<typeof timeEntryUpdateSchema>
export type TimerStartInput = z.infer<typeof timerStartSchema>
export type TimerStopInput = z.infer<typeof timerStopSchema>
