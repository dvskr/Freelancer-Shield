"use client"

import { useState } from 'react'
import { Download, Database, Users, FolderKanban, FileText, Clock, Loader2, AlertTriangle, Trash2 } from 'lucide-react'

const exportOptions = [
    { id: 'all', label: 'All Data', description: 'Complete data export', icon: Database },
    { id: 'clients', label: 'Clients', description: 'Client information', icon: Users },
    { id: 'projects', label: 'Projects', description: 'Projects and milestones', icon: FolderKanban },
    { id: 'invoices', label: 'Invoices', description: 'Invoices and payments', icon: FileText },
    { id: 'time', label: 'Time Entries', description: 'Time tracking data', icon: Clock },
]

export default function DataExport() {
    const [exporting, setExporting] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')

    const handleExport = async (type: string) => {
        setExporting(type)
        try {
            const res = await fetch('/api/settings/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) })
            if (!res.ok) throw new Error('Export failed')
            const data = await res.json()
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `freelancershield-${type}-${new Date().toISOString().split('T')[0]}.json`; a.click()
            URL.revokeObjectURL(url)
        } catch { alert('Failed to export data') } finally { setExporting(null) }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') { alert('Please type DELETE to confirm'); return }
        try {
            const res = await fetch('/api/settings/delete-account', { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete account')
            window.location.href = '/goodbye'
        } catch { alert('Failed to delete account') }
    }

    return (
        <div className="space-y-6">
            {/* Export */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-blue-100 rounded-lg"><Download className="w-5 h-5 text-blue-600" /></div>
                    <div><h3 className="font-semibold text-gray-900">Export Data</h3><p className="text-sm text-gray-500">Download your data in JSON format</p></div></div>
                <div className="grid grid-cols-2 gap-4">
                    {exportOptions.map((option) => (
                        <button key={option.id} onClick={() => handleExport(option.id)} disabled={exporting !== null}
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left">
                            <div className="p-2 bg-gray-100 rounded-lg">{exporting === option.id ? <Loader2 className="w-5 h-5 text-gray-600 animate-spin" /> : <option.icon className="w-5 h-5 text-gray-600" />}</div>
                            <div><p className="font-medium text-gray-900">{option.label}</p><p className="text-xs text-gray-500">{option.description}</p></div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Storage Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Data Storage</h3>
                <div className="space-y-3 text-sm text-gray-600">
                    <p>Your data is stored securely using industry-standard encryption.</p>
                    <p>Files and attachments are stored in cloud storage with automatic backups.</p>
                    <p>We retain your data as long as your account is active. After account deletion, data is permanently removed within 30 days.</p>
                </div>
            </div>

            {/* Delete */}
            <div className="bg-white rounded-xl border border-red-200 p-6">
                <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                    <div><h3 className="font-semibold text-red-900">Danger Zone</h3><p className="text-sm text-red-600">Irreversible account actions</p></div></div>
                {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />Delete Account</button>
                ) : (
                    <div className="p-4 bg-red-50 rounded-lg space-y-4">
                        <p className="text-sm text-red-700"><strong>Warning:</strong> This will permanently delete your account and all associated data. This action cannot be undone.</p>
                        <div><label className="block text-sm font-medium text-red-700 mb-1">Type DELETE to confirm</label>
                            <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} className="w-full px-4 py-2 border border-red-300 rounded-lg text-gray-900" placeholder="DELETE" /></div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE'} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Permanently Delete Account</button>
                            <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
