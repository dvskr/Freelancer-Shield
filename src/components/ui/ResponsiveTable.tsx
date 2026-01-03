"use client"

import { ReactNode } from 'react'

interface Column<T> {
    key: string
    header: string
    render: (item: T) => ReactNode
    hideOnMobile?: boolean
    className?: string
}

interface ResponsiveTableProps<T> {
    columns: Column<T>[]
    data: T[]
    keyExtractor: (item: T) => string
    onRowClick?: (item: T) => void
    mobileRender?: (item: T) => ReactNode
}

export function ResponsiveTable<T>({ columns, data, keyExtractor, onRowClick, mobileRender }: ResponsiveTableProps<T>) {
    const visibleColumns = columns.filter((col) => !col.hideOnMobile)

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((item) => (
                            <tr key={keyExtractor(item)} onClick={() => onRowClick?.(item)} className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}>
                                {columns.map((col) => (
                                    <td key={col.key} className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}>{col.render(item)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
                {data.map((item) => (
                    <div key={keyExtractor(item)} onClick={() => onRowClick?.(item)} className={`bg-white rounded-xl border border-gray-200 p-4 ${onRowClick ? 'cursor-pointer active:bg-gray-50' : ''}`}>
                        {mobileRender ? mobileRender(item) : (
                            <div className="space-y-2">
                                {visibleColumns.map((col) => (
                                    <div key={col.key} className="flex justify-between">
                                        <span className="text-sm text-gray-500">{col.header}</span>
                                        <span className="text-sm font-medium">{col.render(item)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    )
}
