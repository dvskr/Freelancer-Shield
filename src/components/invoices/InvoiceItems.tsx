"use client"

import { formatCurrency } from '@/lib/utils'

interface InvoiceItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
    milestone?: {
        id: string
        name: string
    } | null
}

interface InvoiceItemsProps {
    items: InvoiceItem[]
    subtotal: number
    taxRate: number
    taxAmount: number
    discountAmount: number
    total: number
    editable?: boolean
}

export default function InvoiceItems({
    items,
    subtotal,
    taxRate,
    taxAmount,
    discountAmount,
    total,
    editable = false,
}: InvoiceItemsProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100">
                {items.map((item) => (
                    <div key={item.id} className="px-6 py-4">
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-6">
                                <p className="font-medium text-gray-900">{item.description}</p>
                                {item.milestone && (
                                    <p className="text-sm text-blue-600">
                                        Linked to: {item.milestone.name}
                                    </p>
                                )}
                            </div>
                            <div className="col-span-2 text-center text-gray-700">
                                {item.quantity}
                            </div>
                            <div className="col-span-2 text-right text-gray-700">
                                {formatCurrency(item.unitPrice)}
                            </div>
                            <div className="col-span-2 text-right font-medium text-gray-900">
                                {formatCurrency(item.total)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                        </div>

                        {taxRate > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax ({taxRate}%)</span>
                                <span className="text-gray-900">{formatCurrency(taxAmount)}</span>
                            </div>
                        )}

                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Discount</span>
                                <span className="text-red-600">-{formatCurrency(discountAmount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                            <span className="text-gray-900">Total</span>
                            <span className="text-gray-900">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
