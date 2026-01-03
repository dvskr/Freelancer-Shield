"use client"

import { useState, useEffect } from 'react'
import { FileText, Clock, DollarSign, AlertTriangle, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface InvoiceData {
    statusCounts: Record<string, number>
    statusAmounts: Record<string, number>
    monthlyData: { month: string; count: number; amount: number; paid: number }[]
    summary: { totalInvoices: number; totalInvoiced: number; totalCollected: number; collectionRate: number; avgDaysToPayment: number; totalOverdue: number; overdueCount: number; avgDaysOverdue: number }
}

export default function InvoiceAnalytics() {
    const [data, setData] = useState<InvoiceData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])
    const fetchData = async () => { try { setData(await (await fetch('/api/analytics/invoices')).json()) } catch (e) { } finally { setLoading(false) } }

    if (loading) return <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center"><Loader2 className="w-8 h-8 text-gray-400 animate-spin" /></div>
    if (!data) return null

    const statusColors: Record<string, string> = { draft: 'bg-gray-100 text-gray-700', sent: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700', overdue: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-500' }
    const maxMonthlyAmount = Math.max(...data.monthlyData.map(d => d.amount), 1)

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div><span className="text-sm text-gray-500">Total Invoiced</span></div><p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalInvoiced)}</p><p className="text-xs text-gray-400 mt-1">{data.summary.totalInvoices} invoices</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div><span className="text-sm text-gray-500">Collection Rate</span></div><p className="text-2xl font-bold text-gray-900">{data.summary.collectionRate}%</p><p className="text-xs text-gray-400 mt-1">{formatCurrency(data.summary.totalCollected)} collected</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-purple-100 rounded-lg"><Clock className="w-5 h-5 text-purple-600" /></div><span className="text-sm text-gray-500">Avg Days to Pay</span></div><p className="text-2xl font-bold text-gray-900">{data.summary.avgDaysToPayment}</p><p className="text-xs text-gray-400 mt-1">days from invoice</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div><span className="text-sm text-gray-500">Overdue</span></div><p className="text-2xl font-bold text-red-600">{formatCurrency(data.summary.totalOverdue)}</p><p className="text-xs text-gray-400 mt-1">{data.summary.overdueCount} invoices, avg {data.summary.avgDaysOverdue} days</p></div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Invoice Status Breakdown</h3>
                <div className="grid grid-cols-5 gap-4">
                    {Object.entries(data.statusCounts).map(([status, count]) => (
                        <div key={status} className="text-center">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${statusColors[status]} mb-2`}><span className="font-bold">{count}</span></div>
                            <p className="text-sm font-medium text-gray-700 capitalize">{status}</p>
                            <p className="text-xs text-gray-400">{formatCurrency(data.statusAmounts[status])}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Monthly Invoice Volume</h3>
                <div className="h-48 flex items-end gap-4">
                    {data.monthlyData.map((item) => (
                        <div key={item.month} className="flex-1 flex flex-col items-center">
                            <div className="w-full flex gap-1 items-end" style={{ height: '160px' }}>
                                <div className="flex-1 bg-green-500 rounded-t" style={{ height: `${(item.paid / maxMonthlyAmount) * 100}%` }} title={`Paid: ${formatCurrency(item.paid)}`} />
                                <div className="flex-1 bg-blue-300 rounded-t" style={{ height: `${((item.amount - item.paid) / maxMonthlyAmount) * 100}%` }} title={`Pending: ${formatCurrency(item.amount - item.paid)}`} />
                            </div>
                            <span className="text-xs text-gray-500 mt-2">{item.month}</span><span className="text-xs text-gray-400">{item.count}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded" /><span className="text-sm text-gray-600">Paid</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-300 rounded" /><span className="text-sm text-gray-600">Pending</span></div></div>
            </div>
        </div>
    )
}
