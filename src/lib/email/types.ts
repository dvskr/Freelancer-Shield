export type ReminderType =
    | 'upcoming_due'      // 3 days before due
    | 'due_today'         // On due date
    | 'overdue_gentle'    // 1-3 days overdue
    | 'overdue_firm'      // 7 days overdue
    | 'overdue_final'     // 14 days overdue
    | 'overdue_urgent'    // 30+ days overdue

export interface ReminderEmailData {
    invoiceNumber: string
    invoiceId: string
    clientName: string
    clientEmail: string
    freelancerName: string
    freelancerEmail: string
    amount: number
    dueDate: Date
    daysOverdue: number
    paymentLink: string
    invoiceLink: string
}

export interface ReminderSchedule {
    id: string
    invoiceId: string
    reminderType: ReminderType
    scheduledFor: Date
    status: 'pending' | 'sent' | 'failed' | 'cancelled'
    sentAt?: Date
    error?: string
}

export interface EscalationRule {
    type: ReminderType
    daysFromDue: number  // Negative = before due, Positive = after due
    enabled: boolean
}

export const DEFAULT_ESCALATION_RULES: EscalationRule[] = [
    { type: 'upcoming_due', daysFromDue: -3, enabled: true },
    { type: 'due_today', daysFromDue: 0, enabled: true },
    { type: 'overdue_gentle', daysFromDue: 3, enabled: true },
    { type: 'overdue_firm', daysFromDue: 7, enabled: true },
    { type: 'overdue_final', daysFromDue: 14, enabled: true },
    { type: 'overdue_urgent', daysFromDue: 30, enabled: false },
]
