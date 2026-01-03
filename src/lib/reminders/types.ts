export interface ReminderSettings {
    enabled: boolean
    schedule: {
        upcomingDue: { enabled: boolean; daysBefore: number }
        dueToday: { enabled: boolean }
        overdueGentle: { enabled: boolean; daysAfter: number }
        overdueFirm: { enabled: boolean; daysAfter: number }
        overdueFinal: { enabled: boolean; daysAfter: number }
        overdueUrgent: { enabled: boolean; daysAfter: number }
    }
    defaultMessage?: string
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
    enabled: true,
    schedule: {
        upcomingDue: { enabled: true, daysBefore: 3 },
        dueToday: { enabled: true },
        overdueGentle: { enabled: true, daysAfter: 3 },
        overdueFirm: { enabled: true, daysAfter: 7 },
        overdueFinal: { enabled: true, daysAfter: 14 },
        overdueUrgent: { enabled: false, daysAfter: 30 },
    },
}

export function mergeWithDefaults(settings: Partial<ReminderSettings> | null): ReminderSettings {
    if (!settings) return DEFAULT_REMINDER_SETTINGS

    return {
        enabled: settings.enabled ?? DEFAULT_REMINDER_SETTINGS.enabled,
        schedule: {
            upcomingDue: {
                ...DEFAULT_REMINDER_SETTINGS.schedule.upcomingDue,
                ...settings.schedule?.upcomingDue,
            },
            dueToday: {
                ...DEFAULT_REMINDER_SETTINGS.schedule.dueToday,
                ...settings.schedule?.dueToday,
            },
            overdueGentle: {
                ...DEFAULT_REMINDER_SETTINGS.schedule.overdueGentle,
                ...settings.schedule?.overdueGentle,
            },
            overdueFirm: {
                ...DEFAULT_REMINDER_SETTINGS.schedule.overdueFirm,
                ...settings.schedule?.overdueFirm,
            },
            overdueFinal: {
                ...DEFAULT_REMINDER_SETTINGS.schedule.overdueFinal,
                ...settings.schedule?.overdueFinal,
            },
            overdueUrgent: {
                ...DEFAULT_REMINDER_SETTINGS.schedule.overdueUrgent,
                ...settings.schedule?.overdueUrgent,
            },
        },
        defaultMessage: settings.defaultMessage,
    }
}
