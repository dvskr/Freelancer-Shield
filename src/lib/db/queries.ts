import prisma from '@/lib/prisma'

// Optimized client list query
export async function getClientList(userId: string) {
    return prisma.client.findMany({
        where: { userId },
        select: {
            id: true, name: true, company: true, email: true, createdAt: true,
            _count: { select: { projects: true, invoices: true } },
        },
        orderBy: { createdAt: 'desc' },
    })
}

// Optimized invoice list query
export async function getInvoiceList(userId: string, status?: string) {
    return prisma.invoice.findMany({
        where: { userId, ...(status && { status }) },
        select: {
            id: true, invoiceNumber: true, status: true, total: true, amountPaid: true, dueDate: true, createdAt: true,
            client: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    })
}

// Optimized dashboard data
export async function getDashboardData(userId: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [revenueThisMonth, outstanding, activeProjects, recentInvoices] = await Promise.all([
        prisma.payment.aggregate({
            where: { invoice: { userId }, status: 'completed', createdAt: { gte: startOfMonth } },
            _sum: { amount: true },
        }),
        prisma.invoice.aggregate({
            where: { userId, status: { in: ['sent', 'overdue'] } },
            _sum: { total: true },
            _count: true,
        }),
        prisma.project.count({ where: { userId, status: 'active' } }),
        prisma.invoice.findMany({
            where: { userId },
            select: { id: true, invoiceNumber: true, status: true, total: true, client: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5,
        }),
    ])

    return {
        revenueThisMonth: revenueThisMonth._sum.amount || 0,
        outstanding: outstanding._sum.total || 0,
        outstandingCount: outstanding._count,
        activeProjects,
        recentInvoices,
    }
}
