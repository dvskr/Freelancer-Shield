export interface InvoiceSettings {
    invoicePrefix: string
    invoiceStartNumber: number
    defaultPaymentTerms: number
    acceptedPaymentMethods: string[]
    defaultTaxRate: number
    taxLabel: string
    showTaxId: boolean
    defaultCurrency: string
    currencyPosition: 'before' | 'after'
    accentColor: string
    showLogo: boolean
    defaultNotes: string
    defaultTerms: string
    thankYouMessage: string
    enableLateFees: boolean
    lateFeePercentage: number
    lateFeeGracePeriod: number
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
    invoicePrefix: 'INV-',
    invoiceStartNumber: 1001,
    defaultPaymentTerms: 14,
    acceptedPaymentMethods: ['card', 'bank_transfer'],
    defaultTaxRate: 0,
    taxLabel: 'Tax',
    showTaxId: false,
    defaultCurrency: 'USD',
    currencyPosition: 'before',
    accentColor: '#3B82F6',
    showLogo: true,
    defaultNotes: '',
    defaultTerms: 'Payment is due within the specified period. Late payments may be subject to additional fees.',
    thankYouMessage: 'Thank you for your business!',
    enableLateFees: false,
    lateFeePercentage: 1.5,
    lateFeeGracePeriod: 7,
}

export interface NotificationSettings {
    email: {
        invoicePaid: boolean
        invoiceOverdue: boolean
        newPayment: boolean
        projectUpdate: boolean
        milestoneApproved: boolean
        clientMessage: boolean
        weeklyDigest: boolean
        monthlyReport: boolean
    }
    push: {
        invoicePaid: boolean
        invoiceOverdue: boolean
        newPayment: boolean
        projectUpdate: boolean
        milestoneApproved: boolean
        clientMessage: boolean
    }
    reminders: {
        enabled: boolean
        upcomingDue: boolean
        dueToday: boolean
        overdueGentle: boolean
        overdueFirm: boolean
        overdueFinal: boolean
        overdueUrgent: boolean
    }
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    email: {
        invoicePaid: true,
        invoiceOverdue: true,
        newPayment: true,
        projectUpdate: true,
        milestoneApproved: true,
        clientMessage: true,
        weeklyDigest: false,
        monthlyReport: true,
    },
    push: {
        invoicePaid: true,
        invoiceOverdue: true,
        newPayment: true,
        projectUpdate: false,
        milestoneApproved: true,
        clientMessage: true,
    },
    reminders: {
        enabled: true,
        upcomingDue: true,
        dueToday: true,
        overdueGentle: true,
        overdueFirm: true,
        overdueFinal: true,
        overdueUrgent: false,
    },
}
