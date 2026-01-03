"use client"

import { useState } from 'react'
import Link from 'next/link'
import { FileText, DollarSign, FolderKanban } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RecentActivityProps {
    invoices: any[]
    payments: any[]
    projects: any[]
}

export default function RecentActivity({ invoices, payments, projects }: RecentActivityProps) {
    const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'projects'>('invoices')

    const tabs = [
        { id: 'invoices', label: 'Invoices', icon: FileText },
        { id: 'payments', label: 'Payments', icon: DollarSign },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
    ] as const

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return 'bg-green-100 text-green-700'
            case 'sent':
            case 'active':
                return 'bg-blue-100 text-blue-700'
            case 'overdue':
                return 'bg-red-100 text-red-700'
            case 'draft':
                return 'bg-gray-100 text-gray-700'
            default:
                return 'bg-gray-100 text-gray-600'
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="divide-y divide-gray-100">
                {activeTab === 'invoices' && (
                    invoices.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No recent invoices</div>
                    ) : (
                        invoices.map((invoice) => (
                            <Link
                                key={invoice.id}
                                href={`/invoices/${invoice.id}`}
                                className="flex items-center justify-between p-4 hover:bg-gray-50"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                                    <p className="text-sm text-gray-500">{invoice.client?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{formatCurrency(invoice.total)}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(invoice.status)}`}>
                                        {invoice.status}
                                    </span>
                                </div>
                            </Link>
                        ))
                    )
                )}

                {activeTab === 'payments' && (
                    payments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No recent payments</div>
                    ) : (
                        payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-4">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {payment.invoice?.client?.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {payment.invoice?.invoiceNumber}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-green-600">+{formatCurrency(payment.amount)}</p>
                                    <p className="text-xs text-gray-400">{formatDate(payment.createdAt)}</p>
                                </div>
                            </div>
                        ))
                    )
                )}

                {activeTab === 'projects' && (
                    projects.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No recent projects</div>
                    ) : (
                        projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="flex items-center justify-between p-4 hover:bg-gray-50"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">{project.name}</p>
                                    <p className="text-sm text-gray-500">{project.client?.name}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                            </Link>
                        ))
                    )
                )}
            </div>
        </div>
    )
}
