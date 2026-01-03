import { baseEmailTemplate, formatCurrencyForEmail, formatDateForEmail } from './base'
import { ReminderType, ReminderEmailData } from '../types'

export function getSubjectLine(type: ReminderType, data: ReminderEmailData): string {
    switch (type) {
        case 'upcoming_due':
            return `Reminder: Invoice ${data.invoiceNumber} due in 3 days`
        case 'due_today':
            return `Invoice ${data.invoiceNumber} is due today`
        case 'overdue_gentle':
            return `Friendly reminder: Invoice ${data.invoiceNumber} is past due`
        case 'overdue_firm':
            return `Action required: Invoice ${data.invoiceNumber} is 7 days overdue`
        case 'overdue_final':
            return `Final notice: Invoice ${data.invoiceNumber} requires immediate attention`
        case 'overdue_urgent':
            return `URGENT: Invoice ${data.invoiceNumber} is seriously overdue`
        default:
            return `Payment reminder: Invoice ${data.invoiceNumber}`
    }
}

export function upcomingDueTemplate(data: ReminderEmailData): string {
    return baseEmailTemplate(`
    <p>Hi ${data.clientName},</p>
    
    <p>This is a friendly reminder that your invoice is coming up for payment.</p>
    
    <div class="invoice-box">
      <div class="invoice-row">
        <span>Invoice Number</span>
        <span>${data.invoiceNumber}</span>
      </div>
      <div class="invoice-row">
        <span>Amount Due</span>
        <span class="amount">${formatCurrencyForEmail(data.amount)}</span>
      </div>
      <div class="invoice-row">
        <span>Due Date</span>
        <span>${formatDateForEmail(data.dueDate)}</span>
      </div>
    </div>
    
    <p>To ensure uninterrupted service, please make your payment by the due date.</p>
    
    <p style="text-align: center;">
      <a href="${data.paymentLink}" class="button">Pay Now</a>
    </p>
    
    <p style="text-align: center; font-size: 14px; color: #6b7280;">
      <a href="${data.invoiceLink}" style="color: #3b82f6;">View Invoice Details</a>
    </p>
    
    <p>Thank you for your business!</p>
    
    <p>Best regards,<br>${data.freelancerName}</p>
  `)
}

export function dueTodayTemplate(data: ReminderEmailData): string {
    return baseEmailTemplate(`
    <p>Hi ${data.clientName},</p>
    
    <p><strong>Your invoice is due today.</strong></p>
    
    <div class="invoice-box">
      <div class="invoice-row">
        <span>Invoice Number</span>
        <span>${data.invoiceNumber}</span>
      </div>
      <div class="invoice-row">
        <span>Amount Due</span>
        <span class="amount">${formatCurrencyForEmail(data.amount)}</span>
      </div>
      <div class="invoice-row">
        <span>Due Date</span>
        <span><strong>Today</strong></span>
      </div>
    </div>
    
    <p>Please submit your payment today to avoid any late fees or service interruptions.</p>
    
    <p style="text-align: center;">
      <a href="${data.paymentLink}" class="button">Pay Now</a>
    </p>
    
    <p>If you've already sent payment, please disregard this reminder.</p>
    
    <p>Thank you,<br>${data.freelancerName}</p>
  `)
}

export function overdueGentleTemplate(data: ReminderEmailData): string {
    return baseEmailTemplate(`
    <p>Hi ${data.clientName},</p>
    
    <p>I hope this message finds you well. I wanted to follow up regarding the outstanding invoice below.</p>
    
    <div class="invoice-box">
      <div class="invoice-row">
        <span>Invoice Number</span>
        <span>${data.invoiceNumber}</span>
      </div>
      <div class="invoice-row">
        <span>Amount Due</span>
        <span class="amount">${formatCurrencyForEmail(data.amount)}</span>
      </div>
      <div class="invoice-row">
        <span>Status</span>
        <span><span class="overdue-badge">${data.daysOverdue} days overdue</span></span>
      </div>
    </div>
    
    <p>I understand that things can get busy. If there are any issues with the invoice or if you need to discuss payment arrangements, please don't hesitate to reach out.</p>
    
    <p style="text-align: center;">
      <a href="${data.paymentLink}" class="button">Pay Now</a>
    </p>
    
    <p>Thank you for your attention to this matter.</p>
    
    <p>Best regards,<br>${data.freelancerName}</p>
  `)
}

export function overdueFirmTemplate(data: ReminderEmailData): string {
    return baseEmailTemplate(`
    <p>Hi ${data.clientName},</p>
    
    <p>I'm following up regarding invoice ${data.invoiceNumber}, which is now <strong>${data.daysOverdue} days past due</strong>.</p>
    
    <div class="invoice-box">
      <div class="invoice-row">
        <span>Invoice Number</span>
        <span>${data.invoiceNumber}</span>
      </div>
      <div class="invoice-row">
        <span>Amount Due</span>
        <span class="amount">${formatCurrencyForEmail(data.amount)}</span>
      </div>
      <div class="invoice-row">
        <span>Original Due Date</span>
        <span>${formatDateForEmail(data.dueDate)}</span>
      </div>
      <div class="invoice-row">
        <span>Status</span>
        <span><span class="overdue-badge">${data.daysOverdue} days overdue</span></span>
      </div>
    </div>
    
    <p>Please arrange for payment at your earliest convenience to avoid any impact on our working relationship.</p>
    
    <p style="text-align: center;">
      <a href="${data.paymentLink}" class="button">Pay Now</a>
    </p>
    
    <p>If there's a reason for the delay or if you need to set up a payment plan, please contact me directly at ${data.freelancerEmail}.</p>
    
    <p>Regards,<br>${data.freelancerName}</p>
  `)
}

export function overdueFinalTemplate(data: ReminderEmailData): string {
    return baseEmailTemplate(`
    <p>Hi ${data.clientName},</p>
    
    <p><strong>This is a final notice regarding your outstanding invoice.</strong></p>
    
    <div class="invoice-box" style="border: 2px solid #dc2626;">
      <div class="invoice-row">
        <span>Invoice Number</span>
        <span>${data.invoiceNumber}</span>
      </div>
      <div class="invoice-row">
        <span>Amount Due</span>
        <span class="amount" style="color: #dc2626;">${formatCurrencyForEmail(data.amount)}</span>
      </div>
      <div class="invoice-row">
        <span>Status</span>
        <span><span class="overdue-badge">${data.daysOverdue} days overdue</span></span>
      </div>
    </div>
    
    <p>Despite previous reminders, payment has not been received. To avoid further action, please submit payment immediately.</p>
    
    <p style="text-align: center;">
      <a href="${data.paymentLink}" class="button" style="background-color: #dc2626;">Pay Immediately</a>
    </p>
    
    <p>If you have already made this payment, please forward the confirmation to ${data.freelancerEmail}.</p>
    
    <p>${data.freelancerName}</p>
  `, 'This is an automated final notice. Please respond promptly.')
}

export function overdueUrgentTemplate(data: ReminderEmailData): string {
    return baseEmailTemplate(`
    <p style="text-align: center;">
      <span class="urgent-badge">URGENT ATTENTION REQUIRED</span>
    </p>
    
    <p>Dear ${data.clientName},</p>
    
    <p>Invoice ${data.invoiceNumber} is now <strong>${data.daysOverdue} days past due</strong>. This matter requires your immediate attention.</p>
    
    <div class="invoice-box" style="border: 2px solid #dc2626; background-color: #fef2f2;">
      <div class="invoice-row">
        <span>Invoice Number</span>
        <span>${data.invoiceNumber}</span>
      </div>
      <div class="invoice-row">
        <span>Total Amount Due</span>
        <span class="amount" style="color: #dc2626;">${formatCurrencyForEmail(data.amount)}</span>
      </div>
      <div class="invoice-row">
        <span>Days Overdue</span>
        <span style="color: #dc2626; font-weight: 600;">${data.daysOverdue} days</span>
      </div>
    </div>
    
    <p>Failure to respond to this notice may result in:</p>
    <ul>
      <li>Suspension of services</li>
      <li>Late payment fees</li>
      <li>Collection proceedings</li>
    </ul>
    
    <p style="text-align: center;">
      <a href="${data.paymentLink}" class="button" style="background-color: #dc2626;">Pay Now to Resolve</a>
    </p>
    
    <p>To discuss this matter, contact ${data.freelancerEmail} immediately.</p>
    
    <p>${data.freelancerName}</p>
  `, 'This is an urgent collection notice.')
}

export function getReminderTemplate(type: ReminderType, data: ReminderEmailData): string {
    switch (type) {
        case 'upcoming_due':
            return upcomingDueTemplate(data)
        case 'due_today':
            return dueTodayTemplate(data)
        case 'overdue_gentle':
            return overdueGentleTemplate(data)
        case 'overdue_firm':
            return overdueFirmTemplate(data)
        case 'overdue_final':
            return overdueFinalTemplate(data)
        case 'overdue_urgent':
            return overdueUrgentTemplate(data)
        default:
            return overdueGentleTemplate(data)
    }
}
