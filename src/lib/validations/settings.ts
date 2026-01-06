import { z } from 'zod'

// Notification Settings
export const notificationSettingsSchema = z.object({
    email: z.object({
        invoicePaid: z.boolean().optional(),
        invoiceOverdue: z.boolean().optional(),
        newProject: z.boolean().optional(),
        milestoneApproved: z.boolean().optional(),
        revisionRequested: z.boolean().optional(),
        paymentReminder: z.boolean().optional(),
    }).optional(),
    push: z.object({
        invoicePaid: z.boolean().optional(),
        invoiceOverdue: z.boolean().optional(),
        newProject: z.boolean().optional(),
        milestoneApproved: z.boolean().optional(),
        revisionRequested: z.boolean().optional(),
    }).optional(),
    reminders: z.object({
        enabled: z.boolean().optional(),
        daysBefore: z.number().min(1).max(30).optional(),
        daysAfter: z.number().min(1).max(30).optional(),
    }).optional(),
})

export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>

// Invoice Settings
export const invoiceSettingsSchema = z.object({
    prefix: z.string().max(10).optional(),
    nextNumber: z.number().min(1).optional(),
    defaultDueDays: z.number().min(1).max(365).optional(),
    defaultNotes: z.string().max(1000).optional(),
    defaultTaxRate: z.number().min(0).max(100).optional(),
    showLogo: z.boolean().optional(),
    showPaymentInstructions: z.boolean().optional(),
    paymentInstructions: z.string().max(2000).optional(),
})

export type InvoiceSettingsInput = z.infer<typeof invoiceSettingsSchema>

// Reminder Settings
export const reminderSettingsSchema = z.object({
    enabled: z.boolean().optional(),
    beforeDue: z.array(z.number().min(1).max(30)).optional(),
    afterOverdue: z.array(z.number().min(1).max(90)).optional(),
    maxReminders: z.number().min(1).max(10).optional(),
})

export type ReminderSettingsInput = z.infer<typeof reminderSettingsSchema>

// Password Change
export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>

// Data Export
export const exportDataSchema = z.object({
    includeClients: z.boolean().optional(),
    includeProjects: z.boolean().optional(),
    includeInvoices: z.boolean().optional(),
    includeTimeEntries: z.boolean().optional(),
    format: z.enum(['json', 'csv']).optional(),
})

export type ExportDataInput = z.infer<typeof exportDataSchema>
