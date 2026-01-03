"use client"

import { useState, useEffect } from 'react'
import { Mail, Bell, Clock, Loader2, CheckCircle } from 'lucide-react'
import { DEFAULT_NOTIFICATION_SETTINGS, NotificationSettings as NSettings } from '@/lib/types/settings'

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center justify-between py-3 cursor-pointer">
            <div><p className="text-sm font-medium text-gray-900">{label}</p>{description && <p className="text-xs text-gray-500">{description}</p>}</div>
            <button type="button" onClick={() => onChange(!checked)} className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} /></button>
        </label>
    )
}

export default function NotificationSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [settings, setSettings] = useState<NSettings>(DEFAULT_NOTIFICATION_SETTINGS)

    useEffect(() => { fetch('/api/settings/notifications').then(r => r.json()).then(setSettings).finally(() => setLoading(false)) }, [])

    const saveSettings = async (newSettings: NSettings) => {
        setSaving(true)
        try {
            await fetch('/api/settings/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSettings) })
            setSaved(true); setTimeout(() => setSaved(false), 2000)
        } catch { } finally { setSaving(false) }
    }

    const updateEmail = (key: keyof NSettings['email'], value: boolean) => { const newSettings = { ...settings, email: { ...settings.email, [key]: value } }; setSettings(newSettings); saveSettings(newSettings) }
    const updatePush = (key: keyof NSettings['push'], value: boolean) => { const newSettings = { ...settings, push: { ...settings.push, [key]: value } }; setSettings(newSettings); saveSettings(newSettings) }
    const updateReminders = (key: keyof NSettings['reminders'], value: boolean) => { const newSettings = { ...settings, reminders: { ...settings.reminders, [key]: value } }; setSettings(newSettings); saveSettings(newSettings) }

    if (loading) return <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>

    return (
        <div className="space-y-6">
            {(saving || saved) && (<div className={`p-3 rounded-lg flex items-center gap-2 ${saved ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}<span className="text-sm">{saving ? 'Saving...' : 'Saved'}</span></div>)}

            {/* Email */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-blue-100 rounded-lg"><Mail className="w-5 h-5 text-blue-600" /></div>
                    <div><h3 className="font-semibold text-gray-900">Email Notifications</h3><p className="text-sm text-gray-500">Sent to your email address</p></div></div>
                <div className="divide-y divide-gray-100">
                    <Toggle label="Invoice Paid" description="When a client pays an invoice" checked={settings.email.invoicePaid} onChange={(v) => updateEmail('invoicePaid', v)} />
                    <Toggle label="Invoice Overdue" description="When an invoice becomes overdue" checked={settings.email.invoiceOverdue} onChange={(v) => updateEmail('invoiceOverdue', v)} />
                    <Toggle label="New Payment" description="When you receive any payment" checked={settings.email.newPayment} onChange={(v) => updateEmail('newPayment', v)} />
                    <Toggle label="Project Updates" description="Status changes on your projects" checked={settings.email.projectUpdate} onChange={(v) => updateEmail('projectUpdate', v)} />
                    <Toggle label="Milestone Approved" description="When a client approves a milestone" checked={settings.email.milestoneApproved} onChange={(v) => updateEmail('milestoneApproved', v)} />
                    <Toggle label="Client Messages" description="New messages from clients" checked={settings.email.clientMessage} onChange={(v) => updateEmail('clientMessage', v)} />
                    <Toggle label="Weekly Digest" description="Summary of your week's activity" checked={settings.email.weeklyDigest} onChange={(v) => updateEmail('weeklyDigest', v)} />
                    <Toggle label="Monthly Report" description="Monthly business summary" checked={settings.email.monthlyReport} onChange={(v) => updateEmail('monthlyReport', v)} />
                </div>
            </div>

            {/* Push */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-purple-100 rounded-lg"><Bell className="w-5 h-5 text-purple-600" /></div>
                    <div><h3 className="font-semibold text-gray-900">In-App Notifications</h3><p className="text-sm text-gray-500">Shown within the app</p></div></div>
                <div className="divide-y divide-gray-100">
                    <Toggle label="Invoice Paid" checked={settings.push.invoicePaid} onChange={(v) => updatePush('invoicePaid', v)} />
                    <Toggle label="Invoice Overdue" checked={settings.push.invoiceOverdue} onChange={(v) => updatePush('invoiceOverdue', v)} />
                    <Toggle label="New Payment" checked={settings.push.newPayment} onChange={(v) => updatePush('newPayment', v)} />
                    <Toggle label="Project Updates" checked={settings.push.projectUpdate} onChange={(v) => updatePush('projectUpdate', v)} />
                    <Toggle label="Milestone Approved" checked={settings.push.milestoneApproved} onChange={(v) => updatePush('milestoneApproved', v)} />
                    <Toggle label="Client Messages" checked={settings.push.clientMessage} onChange={(v) => updatePush('clientMessage', v)} />
                </div>
            </div>

            {/* Reminders */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><Clock className="w-5 h-5 text-orange-600" /></div>
                        <div><h3 className="font-semibold text-gray-900">Invoice Reminders</h3><p className="text-sm text-gray-500">Automated reminders to clients</p></div></div>
                    <button type="button" onClick={() => updateReminders('enabled', !settings.reminders.enabled)} className={`relative w-11 h-6 rounded-full transition-colors ${settings.reminders.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.reminders.enabled ? 'translate-x-5' : ''}`} /></button></div>
                {settings.reminders.enabled && (
                    <div className="divide-y divide-gray-100 mt-4 pt-4 border-t">
                        <Toggle label="Upcoming Due (3 days)" description="Friendly reminder before due date" checked={settings.reminders.upcomingDue} onChange={(v) => updateReminders('upcomingDue', v)} />
                        <Toggle label="Due Today" description="Reminder on the due date" checked={settings.reminders.dueToday} onChange={(v) => updateReminders('dueToday', v)} />
                        <Toggle label="Gentle Reminder (3 days late)" description="Polite follow-up" checked={settings.reminders.overdueGentle} onChange={(v) => updateReminders('overdueGentle', v)} />
                        <Toggle label="Firm Reminder (7 days late)" description="More assertive follow-up" checked={settings.reminders.overdueFirm} onChange={(v) => updateReminders('overdueFirm', v)} />
                        <Toggle label="Final Notice (14 days late)" description="Last reminder before escalation" checked={settings.reminders.overdueFinal} onChange={(v) => updateReminders('overdueFinal', v)} />
                        <Toggle label="Urgent Notice (30+ days late)" description="Collection warning" checked={settings.reminders.overdueUrgent} onChange={(v) => updateReminders('overdueUrgent', v)} />
                    </div>)}
            </div>
        </div>
    )
}
