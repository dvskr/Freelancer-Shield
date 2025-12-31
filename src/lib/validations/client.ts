import { z } from 'zod'

export const clientSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional().or(z.literal('')),
    company: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    zipCode: z.string().optional().or(z.literal('')),
    country: z.string().default('US'),
    notes: z.string().optional().or(z.literal('')),
})

export type ClientFormData = z.infer<typeof clientSchema>
