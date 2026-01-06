import { baseEmailTemplate, formatCurrencyForEmail, formatDateForEmail } from './base'

interface PaymentFailedData {
    invoiceNumber: string
    clientName: string
    freelancerName: string
    amount: number
    reason?: string
    retryLink: string
}

export function paymentFailedTemplate(data: PaymentFailedData): string {
    return baseEmailTemplate(`
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 64px; height: 64px; background-color: #fef2f2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      <h2 style="color: #dc2626; margin: 0;">Payment Failed</h2>
    </div>
    
    <p>Hi ${data.clientName},</p>
    
    <p>Unfortunately, your payment for invoice ${data.invoiceNumber} could not be processed.</p>
    
    ${data.reason ? `<p style="color: #6b7280;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
    
    <div class="invoice-box" style="background-color: #fef2f2; border: 1px solid #fecaca;">
      <div class="invoice-row">
        <span>Invoice Number</span>
        <span>${data.invoiceNumber}</span>
      </div>
      <div class="invoice-row">
        <span>Amount Due</span>
        <span class="amount" style="color: #dc2626;">${formatCurrencyForEmail(data.amount)}</span>
      </div>
    </div>
    
    <p style="text-align: center;">
      <a href="${data.retryLink}" class="button" style="background-color: #3b82f6;">Try Again</a>
    </p>
    
    <p style="color: #6b7280; font-size: 14px;">
      If you continue to experience issues, please contact us for assistance.
    </p>
    
    <p>Best regards,<br>${data.freelancerName}</p>
  `)
}

interface FreelancerPaymentNotificationData {
    invoiceNumber: string
    clientName: string
    amount: number
    paidAt: Date
    invoiceLink: string
}

export function freelancerPaymentReceivedTemplate(data: FreelancerPaymentNotificationData): string {
    return baseEmailTemplate(`
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 32px;">💰</span>
      </div>
      <h2 style="color: #16a34a; margin: 0;">You Got Paid!</h2>
    </div>
    
    <p>Great news! You received a payment.</p>
    
    <div class="invoice-box" style="background-color: #f0fdf4; border: 1px solid #86efac;">
      <div class="invoice-row">
        <span>Client</span>
        <span>${data.clientName}</span>
      </div>
      <div class="invoice-row">
        <span>Invoice</span>
        <span>${data.invoiceNumber}</span>
      </div>
      <div class="invoice-row">
        <span>Amount</span>
        <span class="amount" style="color: #16a34a;">${formatCurrencyForEmail(data.amount)}</span>
      </div>
      <div class="invoice-row">
        <span>Date</span>
        <span>${formatDateForEmail(data.paidAt)}</span>
      </div>
    </div>
    
    <p style="text-align: center;">
      <a href="${data.invoiceLink}" class="button" style="background-color: #16a34a;">View Invoice</a>
    </p>
  `)
}
