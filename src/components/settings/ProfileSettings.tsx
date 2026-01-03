"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Globe, Loader2, CheckCircle, Camera } from 'lucide-react'

interface Profile {
    id: string; firstName: string | null; lastName: string | null; email: string; phone: string | null; timezone: string | null; avatarUrl: string | null
}

const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
]

export default function ProfileSettings({ profile }: { profile: Profile }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [firstName, setFirstName] = useState(profile.firstName || '')
    const [lastName, setLastName] = useState(profile.lastName || '')
    const [email, setEmail] = useState(profile.email)
    const [phone, setPhone] = useState(profile.phone || '')
    const [timezone, setTimezone] = useState(profile.timezone || 'America/New_York')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError(null); setSaved(false)

        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, phone: phone || null, timezone }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save')
            }

            setSaved(true)
            router.refresh()
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Profile Photo</h3>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-gray-400" />
                            )}
                        </div>
                        <button type="button" className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div><p className="text-sm text-gray-600">Upload a photo to personalize your account</p><p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max size 2MB.</p></div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white" required /></div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                        <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white" required /></div>
                        <p className="text-xs text-gray-500 mt-1">Changing your email will require verification.</p></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white" /></div></div>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none text-black bg-white">
                            {timezones.map((tz) => (<option key={tz.value} value={tz.value}>{tz.label}</option>))}</select></div></div>
            </div>

            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

            <div className="flex items-center justify-end gap-4">
                {saved && <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5" /><span className="text-sm">Changes saved</span></div>}
                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}Save Changes</button>
            </div>
        </form>
    )
}
