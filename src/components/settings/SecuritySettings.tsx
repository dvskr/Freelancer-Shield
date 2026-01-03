"use client"

import { useState } from 'react'
import { Lock, Shield, Smartphone, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, LogOut } from 'lucide-react'

export default function SecuritySettings() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault(); setError(null); setSuccess(false)
        if (newPassword !== confirmPassword) { setError('New passwords do not match'); return }
        if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
        setLoading(true)
        try {
            const res = await fetch('/api/settings/security/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) })
            if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to change password') }
            setSuccess(true); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
        } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong') } finally { setLoading(false) }
    }

    const handleSignOutAll = async () => {
        if (!confirm('Sign out of all devices? You will need to log in again.')) return
        try { await fetch('/api/auth/signout-all', { method: 'POST' }); window.location.href = '/login' } catch { alert('Failed to sign out') }
    }

    return (
        <div className="space-y-6">
            {/* Password */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-blue-100 rounded-lg"><Lock className="w-5 h-5 text-blue-600" /></div>
                    <div><h3 className="font-semibold text-gray-900">Change Password</h3><p className="text-sm text-gray-500">Update your account password</p></div></div>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <div className="relative"><input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900" required />
                            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative"><input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900" required minLength={8} />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" required /></div>
                    {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-600" /><p className="text-sm text-red-600">{error}</p></div>}
                    {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /><p className="text-sm text-green-600">Password changed successfully</p></div>}
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}Change Password</button>
                </form>
            </div>

            {/* 2FA */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Smartphone className="w-5 h-5 text-green-600" /></div>
                        <div><h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3><p className="text-sm text-gray-500">Add an extra layer of security</p></div></div>
                    <span className="text-sm text-gray-400">Coming soon</span></div>
            </div>

            {/* Sessions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-purple-100 rounded-lg"><Shield className="w-5 h-5 text-purple-600" /></div>
                    <div><h3 className="font-semibold text-gray-900">Active Sessions</h3><p className="text-sm text-gray-500">Manage your logged-in devices</p></div></div>
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-900">Current Session</p><p className="text-xs text-gray-500">Your current browser session</p></div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span></div></div>
                <button onClick={handleSignOutAll} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"><LogOut className="w-4 h-4" />Sign out of all devices</button>
            </div>
        </div>
    )
}
