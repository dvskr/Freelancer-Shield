import React from 'react'
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from '@react-pdf/renderer'

// Styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    logo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    invoiceTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'right',
    },
    invoiceNumber: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'right',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        color: '#6B7280',
        width: 80,
    },
    value: {
        fontWeight: 'bold',
        color: '#111827',
    },
    table: {
        marginTop: 20,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        padding: 10,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    colDescription: { flex: 3 },
    colQty: { flex: 1, textAlign: 'center' },
    colRate: { flex: 1, textAlign: 'right' },
    colAmount: { flex: 1, textAlign: 'right' },
    totals: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 4,
        width: 200,
    },
    totalLabel: {
        flex: 1,
        color: '#6B7280',
    },
    totalValue: {
        flex: 1,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 2,
        borderTopColor: '#111827',
        width: 200,
    },
    grandTotalLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: 'bold',
    },
    grandTotalValue: {
        flex: 1,
        textAlign: 'right',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#059669',
    },
    notes: {
        backgroundColor: '#F9FAFB',
        padding: 15,
        marginTop: 30,
    },
    notesTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    notesText: {
        color: '#6B7280',
        lineHeight: 1.5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 9,
    },
    paid: {
        position: 'absolute',
        top: 200,
        right: 50,
        transform: 'rotate(-30deg)',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#dcfce7',
        opacity: 0.8,
    },
})

interface InvoiceItem {
    description: string
    quantity: number
    unitPrice: number
    amount: number
}

interface InvoicePDFProps {
    invoiceNumber: string
    issueDate: string
    dueDate: string
    status: string
    freelancer: {
        name: string
        email: string
        address?: string
        phone?: string
        taxId?: string
    }
    client: {
        name: string
        company?: string
        email: string
        address?: string
    }
    items: InvoiceItem[]
    subtotal: number
    taxRate: number
    taxAmount: number
    discountAmount: number
    total: number
    amountPaid: number
    currency: string
    notes?: string
    terms?: string
}

function formatMoney(cents: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(cents / 100)
}

export function InvoicePDF({
    invoiceNumber,
    issueDate,
    dueDate,
    status,
    freelancer,
    client,
    items,
    subtotal,
    taxRate,
    taxAmount,
    discountAmount,
    total,
    amountPaid,
    currency,
    notes,
    terms,
}: InvoicePDFProps) {
    const amountDue = total - amountPaid
    const isPaid = status === 'paid'

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Paid watermark */}
                {isPaid && <Text style={styles.paid}>PAID</Text>}

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.logo}>{freelancer.name}</Text>
                        {freelancer.email && (
                            <Text style={{ color: '#6B7280', marginTop: 4 }}>
                                {freelancer.email}
                            </Text>
                        )}
                        {freelancer.phone && (
                            <Text style={{ color: '#6B7280', marginTop: 2 }}>
                                {freelancer.phone}
                            </Text>
                        )}
                        {freelancer.address && (
                            <Text style={{ color: '#6B7280', marginTop: 2, maxWidth: 200 }}>
                                {freelancer.address}
                            </Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
                    </View>
                </View>

                {/* Bill To & Invoice Details */}
                <View style={{ flexDirection: 'row', marginBottom: 30 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>Bill To</Text>
                        <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            {client.name}
                        </Text>
                        {client.company && (
                            <Text style={{ marginBottom: 2 }}>{client.company}</Text>
                        )}
                        <Text style={{ color: '#6B7280' }}>{client.email}</Text>
                        {client.address && (
                            <Text style={{ color: '#6B7280', marginTop: 2 }}>
                                {client.address}
                            </Text>
                        )}
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Issue Date: </Text>
                            <Text style={styles.value}>{issueDate}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Due Date: </Text>
                            <Text style={styles.value}>{dueDate}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Status: </Text>
                            <Text style={[styles.value, { color: isPaid ? '#059669' : '#DC2626' }]}>
                                {status.toUpperCase()}
                            </Text>
                        </View>
                        {freelancer.taxId && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Tax ID: </Text>
                                <Text style={styles.value}>{freelancer.taxId}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Line Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colDescription}>Description</Text>
                        <Text style={styles.colQty}>Qty</Text>
                        <Text style={styles.colRate}>Rate</Text>
                        <Text style={styles.colAmount}>Amount</Text>
                    </View>
                    {items.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.colDescription}>{item.description}</Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colRate}>
                                {formatMoney(item.unitPrice, currency)}
                            </Text>
                            <Text style={styles.colAmount}>
                                {formatMoney(item.amount, currency)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>
                            {formatMoney(subtotal, currency)}
                        </Text>
                    </View>
                    {taxAmount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tax ({taxRate}%)</Text>
                            <Text style={styles.totalValue}>
                                {formatMoney(taxAmount, currency)}
                            </Text>
                        </View>
                    )}
                    {discountAmount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Discount</Text>
                            <Text style={styles.totalValue}>
                                -{formatMoney(discountAmount, currency)}
                            </Text>
                        </View>
                    )}
                    {amountPaid > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Paid</Text>
                            <Text style={[styles.totalValue, { color: '#059669' }]}>
                                -{formatMoney(amountPaid, currency)}
                            </Text>
                        </View>
                    )}
                    <View style={styles.grandTotal}>
                        <Text style={styles.grandTotalLabel}>
                            {isPaid ? 'Total Paid' : 'Amount Due'}
                        </Text>
                        <Text style={styles.grandTotalValue}>
                            {formatMoney(isPaid ? total : amountDue, currency)}
                        </Text>
                    </View>
                </View>

                {/* Notes */}
                {notes && (
                    <View style={styles.notes}>
                        <Text style={styles.notesTitle}>Notes</Text>
                        <Text style={styles.notesText}>{notes}</Text>
                    </View>
                )}

                {/* Terms */}
                {terms && (
                    <View style={[styles.notes, { marginTop: 15 }]}>
                        <Text style={styles.notesTitle}>Terms & Conditions</Text>
                        <Text style={styles.notesText}>{terms}</Text>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Thank you for your business • Generated by FreelancerShield
                </Text>
            </Page>
        </Document>
    )
}
