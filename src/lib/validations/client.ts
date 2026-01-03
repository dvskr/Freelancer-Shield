import { z } from 'zod'

export const clientSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional().default('US'),
    notes: z.string().optional(),
})

export type ClientFormData = z.infer<typeof clientSchema>
