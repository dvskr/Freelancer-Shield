import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const result = await prisma.invoice.updateMany({
            where: { status: 'sent', dueDate: { lt: new Date() } },
            data: { status: 'overdue' },
        })

        return NextResponse.json({ success: true, markedOverdue: result.count })
    } catch (error) {
        console.error('Overdue check error:', error)
        return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
    }
}
