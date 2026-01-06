import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

function formatMoney(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    const { id } = await params

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id, userId: profile.id },
      include: {
        client: true,
        items: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            businessName: true,
            phone: true,
            address: true,
            addressLine2: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            taxId: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const freelancerName = invoice.user.businessName ||
      `${invoice.user.firstName || ''} ${invoice.user.lastName || ''}`.trim() || 'Freelancer'

    const freelancerAddress = [
      invoice.user.address,
      invoice.user.addressLine2,
      [invoice.user.city, invoice.user.state, invoice.user.zipCode].filter(Boolean).join(', '),
      invoice.user.country,
    ].filter(Boolean).join('<br>')

    const clientAddress = invoice.client.address || ''
    const isPaid = invoice.status === 'paid'
    const amountDue = invoice.total - invoice.amountPaid
    const currency = invoice.currency || 'USD'

    // Generate professional HTML invoice (print-ready PDF format)
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        @page { size: A4; margin: 20mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            font-size: 12px; 
            line-height: 1.5; 
            color: #1f2937;
            background: #fff;
        }
        .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #1f2937; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 32px; color: #111827; margin: 0; }
        .invoice-number { color: #6b7280; margin-top: 4px; }
        .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .bill-to, .invoice-info { width: 48%; }
        .section-title { font-size: 10px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; font-weight: 600; }
        .client-name { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .info-label { color: #6b7280; }
        .info-value { font-weight: 600; text-align: right; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
        th:last-child, td:last-child { text-align: right; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .totals { width: 280px; margin-left: auto; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-row.grand { border-top: 2px solid #111827; margin-top: 8px; padding-top: 12px; font-size: 16px; font-weight: bold; }
        .total-row.grand .amount { color: #059669; }
        .notes { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .notes h4 { font-size: 12px; font-weight: 600; margin-bottom: 8px; }
        .notes p { color: #6b7280; font-size: 11px; }
        .paid-stamp { 
            position: absolute; 
            top: 200px; 
            right: 100px; 
            transform: rotate(-15deg);
            font-size: 48px; 
            font-weight: bold; 
            color: rgba(5, 150, 105, 0.3);
            border: 4px solid rgba(5, 150, 105, 0.3);
            padding: 10px 30px;
            border-radius: 8px;
        }
        .status-badge { 
            display: inline-block; 
            padding: 4px 12px; 
            border-radius: 4px; 
            font-size: 11px; 
            font-weight: 600;
        }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-sent { background: #fef3c7; color: #92400e; }
        .status-draft { background: #e5e7eb; color: #374151; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #9ca3af; }
        @media print { 
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
            .invoice { padding: 0; }
        }
    </style>
</head>
<body>
    <div class="invoice" style="position: relative;">
        ${isPaid ? '<div class="paid-stamp">PAID</div>' : ''}
        
        <div class="header">
            <div class="from">
                <div class="logo">${freelancerName}</div>
                <div style="color: #6b7280; font-size: 11px; margin-top: 4px;">
                    ${invoice.user.email}<br>
                    ${invoice.user.phone ? invoice.user.phone + '<br>' : ''}
                    ${freelancerAddress}
                </div>
            </div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-number">${invoice.invoiceNumber}</div>
            </div>
        </div>
        
        <div class="details">
            <div class="bill-to">
                <div class="section-title">Bill To</div>
                <div class="client-name">${invoice.client.name}</div>
                ${invoice.client.company ? `<div>${invoice.client.company}</div>` : ''}
                <div style="color: #6b7280;">${invoice.client.email}</div>
                ${clientAddress ? `<div style="color: #6b7280; margin-top: 4px;">${clientAddress}</div>` : ''}
            </div>
            <div class="invoice-info">
                <div class="info-row">
                    <span class="info-label">Issue Date</span>
                    <span class="info-value">${formatDate(invoice.issueDate || invoice.createdAt)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Due Date</span>
                    <span class="info-value">${formatDate(invoice.dueDate)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status</span>
                    <span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span>
                </div>
                ${invoice.user.taxId ? `
                <div class="info-row">
                    <span class="info-label">Tax ID</span>
                    <span class="info-value">${invoice.user.taxId}</span>
                </div>
                ` : ''}
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="width: 80px; text-align: center;">Qty</th>
                    <th style="width: 100px;">Rate</th>
                    <th style="width: 100px;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td>${formatMoney(item.unitPrice, currency)}</td>
                    <td>${formatMoney(item.amount, currency)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals">
            <div class="total-row">
                <span>Subtotal</span>
                <span>${formatMoney(invoice.subtotal, currency)}</span>
            </div>
            ${invoice.taxAmount > 0 ? `
            <div class="total-row">
                <span>Tax (${invoice.taxRate}%)</span>
                <span>${formatMoney(invoice.taxAmount, currency)}</span>
            </div>
            ` : ''}
            ${invoice.discountAmount && invoice.discountAmount > 0 ? `
            <div class="total-row">
                <span>Discount</span>
                <span>-${formatMoney(invoice.discountAmount, currency)}</span>
            </div>
            ` : ''}
            ${invoice.amountPaid > 0 ? `
            <div class="total-row" style="color: #059669;">
                <span>Paid</span>
                <span>-${formatMoney(invoice.amountPaid, currency)}</span>
            </div>
            ` : ''}
            <div class="total-row grand">
                <span>${isPaid ? 'Total Paid' : 'Amount Due'}</span>
                <span class="amount">${formatMoney(isPaid ? invoice.total : amountDue, currency)}</span>
            </div>
        </div>
        
        ${invoice.notes ? `
        <div class="notes">
            <h4>Notes</h4>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}
        
        ${invoice.terms ? `
        <div class="notes" style="margin-top: 15px;">
            <h4>Terms & Conditions</h4>
            <p>${invoice.terms}</p>
        </div>
        ` : ''}
        
        <div class="footer">
            Thank you for your business • Generated by FreelancerShield
        </div>
    </div>
    
    <script>
        // Auto-print when opened
        // window.onload = () => window.print();
    </script>
</body>
</html>
        `.trim()

    // Return HTML that can be printed to PDF by the browser
    // This is the most reliable cross-platform solution
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
      },
    })
  } catch (error) {
    console.error('Invoice PDF error:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}
