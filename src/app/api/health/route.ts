import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    const checks = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        checks: { database: 'unknown', memory: 'unknown' },
    }

    try {
        await prisma.$queryRaw`SELECT 1`
        checks.checks.database = 'healthy'
    } catch {
        checks.checks.database = 'unhealthy'
        checks.status = 'degraded'
    }

    const used = process.memoryUsage()
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024)
    checks.checks.memory = heapUsedMB < heapTotalMB * 0.9 ? 'healthy' : 'warning'

    return NextResponse.json(checks, { status: checks.status === 'healthy' ? 200 : 503 })
}
