"use client"

import { useState, useEffect } from 'react'
import {
    Bell,
    Save,
    Loader2,
    AlertCircle,
    Clock,
    Mail,
    Calendar
} from 'lucide-react'
import { ReminderSettings as ReminderSettingsType, DEFAULT_REMINDER_SETTINGS } from '@/lib/reminders/types'

export default function ReminderSettings() {
    const [settings, setSettings] = useState<ReminderSettingsType>(DEFAULT_REMINDER_SETTINGS)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings/reminders')
            const data = await res.json()
            setSettings(data)
        } catch (err) {
            console.error('Failed to fetch settings:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await fetch('/api/settings/reminders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (err) {
            console.error('Failed to save settings:', err)
        } finally {
            setSaving(false)
        }
    }

    const toggleReminder = (key: keyof typeof settings.schedule) => {
        setSettings({
            ...settings,
            schedule: {
                ...settings.schedule,
                [key]: {
                    ...settings.schedule[key],
                    enabled: !settings.schedule[key].enabled,
                },
            },
        })
    }

    const updateDays = (key: keyof typeof settings.schedule, field: string, value: number) => {
        setSettings({
            ...settings,
            schedule: {
                ...settings.schedule,
                [key]: {
                    ...settings.schedule[key],
                    [field]: value,
                },
            },
        })
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    <span className="text-gray-500">Loading settings...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Payment Reminders</h3>
                            <p className="text-sm text-gray-500">Automatic email reminders for unpaid invoices</p>
                        </div>
                    </div>

                    {/* Master Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={() => setSettings({ ...settings, enabled: !settings.enabled })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            {settings.enabled && (
                <div className="p-6 space-y-4">
                    {/* Before Due Date */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="font-medium text-gray-900">Upcoming Due Reminder</p>
                                <p className="text-sm text-gray-500">Remind before invoice is due</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="14"
                                    value={settings.schedule.upcomingDue.daysBefore}
                                    onChange={(e) => updateDays('upcomingDue', 'daysBefore', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
                                    disabled={!settings.schedule.upcomingDue.enabled}
                                />
                                <span className="text-sm text-gray-500">days before</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.schedule.upcomingDue.enabled}
                                    onChange={() => toggleReminder('upcomingDue')}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Due Today */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <div>
                                <p className="font-medium text-gray-900">Due Today Reminder</p>
                                <p className="text-sm text-gray-500">Send on the due date</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.schedule.dueToday.enabled}
                                onChange={() => toggleReminder('dueToday')}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Overdue - Gentle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-orange-500" />
                            <div>
                                <p className="font-medium text-gray-900">Gentle Overdue Reminder</p>
                                <p className="text-sm text-gray-500">Friendly follow-up</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="7"
                                    value={settings.schedule.overdueGentle.daysAfter}
                                    onChange={(e) => updateDays('overdueGentle', 'daysAfter', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
                                    disabled={!settings.schedule.overdueGentle.enabled}
                                />
                                <span className="text-sm text-gray-500">days after</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.schedule.overdueGentle.enabled}
                                    onChange={() => toggleReminder('overdueGentle')}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Overdue - Firm */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            <div>
                                <p className="font-medium text-gray-900">Firm Reminder</p>
                                <p className="text-sm text-gray-500">Request action</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="5"
                                    max="14"
                                    value={settings.schedule.overdueFirm.daysAfter}
                                    onChange={(e) => updateDays('overdueFirm', 'daysAfter', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
                                    disabled={!settings.schedule.overdueFirm.enabled}
                                />
                                <span className="text-sm text-gray-500">days after</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.schedule.overdueFirm.enabled}
                                    onChange={() => toggleReminder('overdueFirm')}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Overdue - Final */}
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <div>
                                <p className="font-medium text-gray-900">Final Notice</p>
                                <p className="text-sm text-gray-500">Strong warning</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="10"
                                    max="21"
                                    value={settings.schedule.overdueFinal.daysAfter}
                                    onChange={(e) => updateDays('overdueFinal', 'daysAfter', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
                                    disabled={!settings.schedule.overdueFinal.enabled}
                                />
                                <span className="text-sm text-gray-500">days after</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.schedule.overdueFinal.enabled}
                                    onChange={() => toggleReminder('overdueFinal')}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Overdue - Urgent (Off by default) */}
                    <div className="flex items-center justify-between p-4 bg-red-100 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <div>
                                <p className="font-medium text-gray-900">Urgent Collection Notice</p>
                                <p className="text-sm text-gray-500">Strongest warning (off by default)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="21"
                                    max="60"
                                    value={settings.schedule.overdueUrgent.daysAfter}
                                    onChange={(e) => updateDays('overdueUrgent', 'daysAfter', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
                                    disabled={!settings.schedule.overdueUrgent.enabled}
                                />
                                <span className="text-sm text-gray-500">days after</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.schedule.overdueUrgent.enabled}
                                    onChange={() => toggleReminder('overdueUrgent')}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <Save className="w-4 h-4" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Settings
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
