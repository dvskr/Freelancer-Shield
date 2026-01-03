"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Globe, MapPin, FileText, Loader2, CheckCircle, Upload } from 'lucide-react'

const businessTypes = [
    { value: 'sole_proprietor', label: 'Sole Proprietor' },
    { value: 'llc', label: 'LLC' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'other', label: 'Other' },
]

const taxIdTypes = [
    { value: 'ein', label: 'EIN (US)' },
    { value: 'ssn', label: 'SSN (US)' },
    { value: 'vat', label: 'VAT Number (EU)' },
    { value: 'gst', label: 'GST Number' },
    { value: 'abn', label: 'ABN (Australia)' },
    { value: 'other', label: 'Other' },
]

const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Netherlands', 'Other']

export default function BusinessSettings() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [businessName, setBusinessName] = useState('')
    const [businessType, setBusinessType] = useState('')
    const [businessWebsite, setBusinessWebsite] = useState('')
    const [address, setAddress] = useState('')
    const [addressLine2, setAddressLine2] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [zipCode, setZipCode] = useState('')
    const [country, setCountry] = useState('')
    const [taxId, setTaxId] = useState('')
    const [taxIdType, setTaxIdType] = useState('')

    useEffect(() => {
        fetch('/api/settings/business').then(res => res.json()).then(data => {
            setBusinessName(data.businessName || ''); setBusinessType(data.businessType || ''); setBusinessWebsite(data.businessWebsite || '')
            setAddress(data.address || ''); setAddressLine2(data.addressLine2 || ''); setCity(data.city || ''); setState(data.state || '')
            setZipCode(data.zipCode || ''); setCountry(data.country || ''); setTaxId(data.taxId || ''); setTaxIdType(data.taxIdType || '')
        }).finally(() => setLoading(false))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null); setSaved(false)
        try {
            const res = await fetch('/api/settings/business', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessName: businessName || null, businessType: businessType || null, businessWebsite: businessWebsite || null, address: address || null, addressLine2: addressLine2 || null, city: city || null, state: state || null, zipCode: zipCode || null, country: country || null, taxId: taxId || null, taxIdType: taxIdType || null }),
            })
            if (!res.ok) throw new Error((await res.json()).error || 'Failed to save')
            setSaved(true); router.refresh(); setTimeout(() => setSaved(false), 3000)
        } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong') } finally { setSaving(false) }
    }

    if (loading) return <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Business Logo</h3>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"><Building2 className="w-10 h-10 text-gray-400" /></div>
                    <div><button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Upload className="w-4 h-4" />Upload Logo</button>
                        <p className="text-xs text-gray-500 mt-2">Appears on invoices and contracts. PNG or SVG recommended.</p></div>
                </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Business Details</h3>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                        <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Business Name" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" /></div>
                        <p className="text-xs text-gray-500 mt-1">Leave blank to use your personal name on documents.</p></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
                                <option value="">Select type</option>{businessTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="url" value={businessWebsite} onChange={(e) => setBusinessWebsite(e.target.value)} placeholder="https://yourwebsite.com" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" /></div></div>
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Business Address</h3>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                        <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" /></div></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                        <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apt, suite, unit, etc. (optional)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label><input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label><input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
                                <option value="">Select country</option>{countries.map((c) => (<option key={c} value={c}>{c}</option>))}</select></div>
                    </div>
                </div>
            </div>

            {/* Tax */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tax Information</h3>
                <p className="text-sm text-gray-500 mb-4">Your tax ID will appear on invoices when required.</p>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Tax ID Type</label>
                        <select value={taxIdType} onChange={(e) => setTaxIdType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
                            <option value="">Select type</option>{taxIdTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Tax ID Number</label>
                        <div className="relative"><FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="XX-XXXXXXX" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" /></div></div>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

            <div className="flex items-center justify-end gap-4">
                {saved && <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5" /><span className="text-sm">Changes saved</span></div>}
                <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}Save Changes</button>
            </div>
        </form>
    )
}
