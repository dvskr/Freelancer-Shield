import { z } from 'zod'

// Contract Create/Update
export const contractSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    projectId: z.string().optional().nullable(),
    templateId: z.string().optional().nullable(),
    title: z.string().min(1, 'Title is required').max(200),
    content: z.string().min(1, 'Contract content is required'),
    status: z.enum(['draft', 'sent', 'signed', 'expired', 'cancelled']).optional(),
    expiresAt: z.string().optional().nullable(),
})

export type ContractInput = z.infer<typeof contractSchema>

export const contractUpdateSchema = contractSchema.partial()

export type ContractUpdateInput = z.infer<typeof contractUpdateSchema>

// Contract Sign
export const contractSignSchema = z.object({
    signatureName: z.string().min(1, 'Full name is required'),
    signatureData: z.string().min(1, 'Signature is required'), // base64 image or similar
    ipAddress: z.string().optional(),
})

export type ContractSignInput = z.infer<typeof contractSignSchema>

// Contract Template
export const contractTemplateSchema = z.object({
    name: z.string().min(1, 'Template name is required').max(200),
    description: z.string().max(500).optional(),
    content: z.string().min(1, 'Template content is required'),
    isDefault: z.boolean().optional(),
    category: z.string().max(50).optional(),
})

export type ContractTemplateInput = z.infer<typeof contractTemplateSchema>

export const contractTemplateUpdateSchema = contractTemplateSchema.partial()

export type ContractTemplateUpdateInput = z.infer<typeof contractTemplateUpdateSchema>
