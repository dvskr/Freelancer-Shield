import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import InvoiceForm from '@/components/invoices/InvoiceForm'
import { generateInvoiceNumber } from '@/lib/utils'

export const metadata = {
    title: 'New Invoice | FreelancerShield',
}

interface NewInvoicePageProps {
    searchParams: Promise<{
        clientId?: string
        projectId?: string
    }>
}

export default async function NewInvoicePage({ searchParams }: NewInvoicePageProps) {
    const { profile } = await requireAuth()
    const { clientId, projectId } = await searchParams

    const [clients, projects, lastInvoice] = await Promise.all([
        prisma.client.findMany({
            where: { userId: profile.id },
            select: { id: true, name: true, company: true },
            orderBy: { name: 'asc' },
        }),
        prisma.project.findMany({
            where: { userId: profile.id },
            select: {
                id: true,
                name: true,
                clientId: true,
                milestones: {
                    select: { id: true, name: true, amount: true, status: true },
                    orderBy: { orderIndex: 'asc' },
                },
            },
            orderBy: { name: 'asc' },
        }),
        prisma.invoice.findFirst({
            where: { userId: profile.id },
            orderBy: { createdAt: 'desc' },
            select: { invoiceNumber: true },
        }),
    ])

    if (clients.length === 0) {
        redirect('/clients/new?from=invoices')
    }

    // Generate next invoice number
    const nextInvoiceNumber = generateInvoiceNumber(lastInvoice?.invoiceNumber)

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <Link
                    href="/invoices"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Invoices
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
                <p className="text-gray-600 mt-1">
                    Create a new invoice for your client.
                </p>
            </div>

            <InvoiceForm
                clients={clients}
                projects={projects}
                preselectedClientId={clientId}
                preselectedProjectId={projectId}
                nextInvoiceNumber={nextInvoiceNumber}
            />
        </div>
    )
}
