export interface StripePaymentMetadata {
    invoiceId: string
    invoiceNumber: string
    userId?: string
    clientId?: string
}

export interface PaymentLinkData {
    id: string
    url: string
    active: boolean
    metadata: StripePaymentMetadata
}

export interface CheckoutSessionData {
    id: string
    url: string
    paymentStatus: string
    amountTotal: number
    customerEmail: string | null
}

export type PaymentStatus =
    | 'pending'
    | 'processing'
    | 'succeeded'
    | 'failed'
    | 'cancelled'
    | 'refunded'
