import { baseEmailTemplate, formatCurrencyForEmail, formatDateForEmail } from './base'

interface InvoiceSentData {
    invoiceNumber: string
    clientName: string
    freelancerName: string
    amount: number
    dueDate: Date
    paymentLink: string
    invoiceLink: string
    projectName?: string
}

export function invoiceSentTemplate(data: InvoiceSentData): string {
    return baseEmailTemplate(`
    <p>Hi ${data.clientName},</p>
    
    <p>${data.freelancerName} has sent you an invoice${data.projectName ? ` for ${data.projectName}` : ''}.</p>
    
    <div class="invoice-box">
      <div class="invoice-row">
        <span>Invoice Number</span>
        <span>${data.invoiceNumber}</span>
      </div>
      <div class="invoice-row">
        <span>Amount</span>
        <span class="amount">${formatCurrencyForEmail(data.amount)}</span>
      </div>
      <div class="invoice-row">
        <span>Due Date</span>
        <span>${formatDateForEmail(data.dueDate)}</span>
      </div>
    </div>
    
    <p style="text-align: center;">
      <a href="${data.paymentLink}" class="button">View & Pay Invoice</a>
    </p>
    
    <p style="text-align: center; font-size: 14px; color: #6b7280;">
      <a href="${data.invoiceLink}" style="color: #3b82f6;">Download PDF</a>
    </p>
    
    <p>Thank you for your business!</p>
    
    <p>Best regards,<br>${data.freelancerName}</p>
  `)
}

interface PaymentReceivedData {
    invoiceNumber: string
    clientName: string
    freelancerName: string
    amount: number
    paidAt: Date
    receiptLink: string
}

export function paymentReceivedTemplate(data: PaymentReceivedData): string {
    return baseEmailTemplate(`
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      </div>
      <h2 style="color: #16a34a; margin: 0;">Payment Received!</h2>
    </div>
    
    <p>Hi ${data.clientName},</p>
    
    <p>We've received your payment. Thank you!</p>
    
    <div class="invoice-box" style="background-color: #f0fdf4; border: 1px solid #86efac;">
      <div class="invoice-row">
        <span>Invoice Number</span>
        <span>${data.invoiceNumber}</span>
      </div>
      <div class="invoice-row">
        <span>Amount Paid</span>
        <span class="amount" style="color: #16a34a;">${formatCurrencyForEmail(data.amount)}</span>
      </div>
      <div class="invoice-row">
        <span>Date</span>
        <span>${formatDateForEmail(data.paidAt)}</span>
      </div>
    </div>
    
    <p style="text-align: center;">
      <a href="${data.receiptLink}" class="button" style="background-color: #16a34a;">Download Receipt</a>
    </p>
    
    <p>Thank you for your prompt payment!</p>
    
    <p>Best regards,<br>${data.freelancerName}</p>
  `)
}
