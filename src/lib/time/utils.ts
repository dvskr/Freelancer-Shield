export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
        return `${mins}m`
    }

    if (mins === 0) {
        return `${hours}h`
    }

    return `${hours}h ${mins}m`
}

export function formatDurationLong(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    const parts = []
    if (hours > 0) {
        parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
    }
    if (mins > 0) {
        parts.push(`${mins} minute${mins === 1 ? '' : 's'}`)
    }

    return parts.join(' ') || '0 minutes'
}

export function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

export function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
    // Format: "1:30" or "01:30"
    const colonMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/)
    if (colonMatch) {
        return {
            hours: parseInt(colonMatch[1]),
            minutes: parseInt(colonMatch[2]),
        }
    }

    // Format: "1h 30m" or "1h" or "30m"
    const hmMatch = timeStr.match(/^(?:(\d+)h)?\s*(?:(\d+)m)?$/)
    if (hmMatch && (hmMatch[1] || hmMatch[2])) {
        return {
            hours: parseInt(hmMatch[1] || '0'),
            minutes: parseInt(hmMatch[2] || '0'),
        }
    }

    // Format: "1.5h" or "1.5"
    const decimalMatch = timeStr.match(/^(\d+(?:\.\d+)?)(h)?$/)
    if (decimalMatch) {
        const decimal = parseFloat(decimalMatch[1])
        const hours = Math.floor(decimal)
        const minutes = Math.round((decimal - hours) * 60)
        return { hours, minutes }
    }

    // Format: just minutes "90"
    const minutesOnly = timeStr.match(/^(\d+)$/)
    if (minutesOnly) {
        const totalMins = parseInt(minutesOnly[1])
        return {
            hours: Math.floor(totalMins / 60),
            minutes: totalMins % 60,
        }
    }

    return null
}

export function timeToMinutes(hours: number, minutes: number): number {
    return hours * 60 + minutes
}

export function minutesToDecimalHours(minutes: number): number {
    return Math.round((minutes / 60) * 100) / 100
}

export function calculateAmount(minutes: number, hourlyRateCents: number): number {
    const hours = minutes / 60
    return Math.round(hours * hourlyRateCents)
}

export function getWeekDates(date: Date): Date[] {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)

    const monday = new Date(date)
    monday.setDate(diff)
    monday.setHours(0, 0, 0, 0)

    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        dates.push(d)
    }

    return dates
}

export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )
}

export function getDateRange(period: 'today' | 'week' | 'month' | 'year'): { start: Date; end: Date } {
    const now = new Date()
    const start = new Date(now)
    const end = new Date(now)

    switch (period) {
        case 'today':
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            break
        case 'week':
            const day = start.getDay()
            const diff = start.getDate() - day + (day === 0 ? -6 : 1)
            start.setDate(diff)
            start.setHours(0, 0, 0, 0)
            end.setDate(start.getDate() + 6)
            end.setHours(23, 59, 59, 999)
            break
        case 'month':
            start.setDate(1)
            start.setHours(0, 0, 0, 0)
            end.setMonth(end.getMonth() + 1)
            end.setDate(0)
            end.setHours(23, 59, 59, 999)
            break
        case 'year':
            start.setMonth(0, 1)
            start.setHours(0, 0, 0, 0)
            end.setMonth(11, 31)
            end.setHours(23, 59, 59, 999)
            break
    }

    return { start, end }
}
