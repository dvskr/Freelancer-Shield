import { NextRequest, NextResponse } from 'next/server'
import { processScheduledReminders } from '@/lib/reminders/scheduler'

// This endpoint should be called by a cron job service (e.g., Vercel Cron, Railway, etc.)

export async function GET(request: NextRequest) {
    // Verify cron secret - FAIL CLOSED: reject if no secret configured
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
        console.error('CRON_SECRET environment variable is not set')
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const results = await processScheduledReminders()

        console.log('Reminder processing complete:', results)

        return NextResponse.json({
            success: true,
            ...results,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Cron job error:', error)
        return NextResponse.json(
            { error: 'Processing failed', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
    return GET(request)
}
