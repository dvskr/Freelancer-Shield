"use client"

import { useState, useEffect } from 'react'
import { Hash, Calendar, DollarSign, Percent, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { DEFAULT_INVOICE_SETTINGS, InvoiceSettings as ISettings } from '@/lib/types/settings'

const currencies = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'INR', label: 'INR - Indian Rupee' },
]

const paymentTermsOptions = [
    { value: 7, label: 'Net 7 (Due in 7 days)' },
    { value: 14, label: 'Net 14 (Due in 14 days)' },
    { value: 30, label: 'Net 30 (Due in 30 days)' },
    { value: 45, label: 'Net 45 (Due in 45 days)' },
    { value: 60, label: 'Net 60 (Due in 60 days)' },
    { value: 0, label: 'Due on Receipt' },
]

export default function InvoiceSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [settings, setSettings] = useState<ISettings>(DEFAULT_INVOICE_SETTINGS)

    useEffect(() => { fetch('/api/settings/invoices').then(r => r.json()).then(setSettings).finally(() => setLoading(false)) }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null); setSaved(false)
        try {
            const res = await fetch('/api/settings/invoices', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
            if (!res.ok) throw new Error('Failed to save')
            setSaved(true); setTimeout(() => setSaved(false), 3000)
        } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong') } finally { setSaving(false) }
    }

    const update = <K extends keyof ISettings>(key: K, value: ISettings[K]) => setSettings({ ...settings, [key]: value })

    if (loading) return <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Numbering */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Invoice Numbering</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
                        <div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" value={settings.invoicePrefix} onChange={(e) => update('invoicePrefix', e.target.value)} placeholder="INV-" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Starting Number</label>
                        <input type="number" value={settings.invoiceStartNumber} onChange={(e) => update('invoiceStartNumber', parseInt(e.target.value))} min={1} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Example: {settings.invoicePrefix}{settings.invoiceStartNumber}</p>
            </div>

            {/* Payment & Currency */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Payment & Currency</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Payment Terms</label>
                        <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select value={settings.defaultPaymentTerms} onChange={(e) => update('defaultPaymentTerms', parseInt(e.target.value))} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none text-gray-900">
                                {paymentTermsOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}</select></div></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                        <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select value={settings.defaultCurrency} onChange={(e) => update('defaultCurrency', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none text-gray-900">
                                {currencies.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}</select></div></div>
                </div>
            </div>

            {/* Tax */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tax Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate</label>
                        <div className="relative"><Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="number" value={settings.defaultTaxRate} onChange={(e) => update('defaultTaxRate', parseFloat(e.target.value))} min={0} max={100} step={0.1} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Tax Label</label>
                        <input type="text" value={settings.taxLabel} onChange={(e) => update('taxLabel', e.target.value)} placeholder="Tax, VAT, GST" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer mt-4">
                    <input type="checkbox" checked={settings.showTaxId} onChange={(e) => update('showTaxId', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Show tax ID on invoices</span></label>
            </div>

            {/* Late Fees */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900">Late Fees</h3>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.enableLateFees} onChange={(e) => update('enableLateFees', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">Enable</span></label></div>
                {settings.enableLateFees && (
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Late Fee Percentage</label>
                            <div className="relative"><Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="number" value={settings.lateFeePercentage} onChange={(e) => update('lateFeePercentage', parseFloat(e.target.value))} min={0} max={100} step={0.1} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (days)</label>
                            <input type="number" value={settings.lateFeeGracePeriod} onChange={(e) => update('lateFeeGracePeriod', parseInt(e.target.value))} min={0} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div>
                    </div>)}
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Appearance</h3>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={settings.accentColor} onChange={(e) => update('accentColor', e.target.value)} className="w-12 h-10 rounded border border-gray-300 cursor-pointer" />
                            <input type="text" value={settings.accentColor} onChange={(e) => update('accentColor', e.target.value)} className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" /></div></div>
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={settings.showLogo} onChange={(e) => update('showLogo', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">Show business logo on invoices</span></label>
                </div>
            </div>

            {/* Default Text */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Default Text</h3>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Invoice Notes</label>
                        <textarea value={settings.defaultNotes} onChange={(e) => update('defaultNotes', e.target.value)} rows={3} placeholder="Default notes..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                        <textarea value={settings.defaultTerms} onChange={(e) => update('defaultTerms', e.target.value)} rows={3} placeholder="Payment terms..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Thank You Message</label>
                        <input type="text" value={settings.thankYouMessage} onChange={(e) => update('thankYouMessage', e.target.value)} placeholder="Message shown after payment..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><p className="text-sm text-red-600">{error}</p></div>}

            <div className="flex items-center justify-end gap-4">
                {saved && <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5" /><span className="text-sm">Changes saved</span></div>}
                <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}Save Changes</button>
            </div>
        </form>
    )
}
