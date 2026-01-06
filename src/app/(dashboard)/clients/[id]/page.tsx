import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    MapPin,
    Edit,
    FolderKanban,
    FileText,
    Plus,
    Calendar
} from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate, formatCurrency } from '@/lib/utils'
import DeleteClientButton from '@/components/clients/delete-client-button'
import GeneratePortalLink from '@/components/clients/generate-portal-link'

interface ClientPageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ClientPageProps) {
    const { id } = await params
    const client = await prisma.client.findUnique({
        where: { id },
        select: { name: true },
    })

    return {
        title: client ? `${client.name} | FreelancerShield` : 'Client Not Found',
    }
}

export default async function ClientPage({ params }: ClientPageProps) {
    const { profile } = await requireAuth()
    const { id } = await params

    const client = await prisma.client.findUnique({
        where: { id, userId: profile.id },
        include: {
            projects: {
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
            invoices: {
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
            _count: {
                select: {
                    projects: true,
                    invoices: true,
                },
            },
        },
    })

    if (!client) {
        notFound()
    }

    // Calculate financial stats
    const allInvoices = await prisma.invoice.findMany({
        where: { clientId: client.id },
        select: { total: true, amountPaid: true, status: true },
    })

    const totalInvoiced = allInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalPaid = allInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link
                        href="/clients"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Clients
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-2xl">
                                {client.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                            {client.company && (
                                <p className="text-gray-500 flex items-center gap-1 mt-1">
                                    <Building2 className="w-4 h-4" />
                                    {client.company}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/clients/${client.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Link>
                    <DeleteClientButton clientId={client.id} clientName={client.name} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{client._count.projects}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{client._count.invoices}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Invoiced</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvoiced)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                                {client.email}
                            </a>
                        </div>
                        {client.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <a href={`tel:${client.phone}`} className="text-gray-700 hover:text-gray-900">
                                    {client.phone}
                                </a>
                            </div>
                        )}
                        {(client.address || client.city) && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="text-gray-700">
                                    {client.address && <p>{client.address}</p>}
                                    {(client.city || client.state || client.zipCode) && (
                                        <p>
                                            {[client.city, client.state, client.zipCode].filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                    {client.country && <p>{client.country}</p>}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3 pt-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-500 text-sm">
                                Client since {formatDate(client.createdAt)}
                            </span>
                        </div>
                    </div>

                    {client.notes && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{client.notes}</p>
                        </div>
                    )}
                </div>

                {/* Recent Projects */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                        <Link
                            href={`/projects/new?clientId=${client.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            New
                        </Link>
                    </div>

                    {client.projects.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FolderKanban className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No projects yet</p>
                            <Link
                                href={`/projects/new?clientId=${client.id}`}
                                className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                            >
                                Create first project
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {client.projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="block p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">{project.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-700' :
                                                project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                    project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatCurrency(project.totalAmount)}
                                    </p>
                                </Link>
                            ))}
                            {client._count.projects > 5 && (
                                <Link
                                    href={`/projects?clientId=${client.id}`}
                                    className="block text-center text-sm text-blue-600 hover:text-blue-700 py-2"
                                >
                                    View all {client._count.projects} projects →
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent Invoices */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
                        <Link
                            href={`/invoices/new?clientId=${client.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            New
                        </Link>
                    </div>

                    {client.invoices.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No invoices yet</p>
                            <Link
                                href={`/invoices/new?clientId=${client.id}`}
                                className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                            >
                                Create first invoice
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {client.invoices.map((invoice) => (
                                <Link
                                    key={invoice.id}
                                    href={`/invoices/${invoice.id}`}
                                    className="block p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                    invoice.status === 'viewed' ? 'bg-purple-100 text-purple-700' :
                                                        invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                            }`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatCurrency(invoice.total)} • Due {formatDate(invoice.dueDate)}
                                    </p>
                                </Link>
                            ))}
                            {client._count.invoices > 5 && (
                                <Link
                                    href={`/invoices?clientId=${client.id}`}
                                    className="block text-center text-sm text-blue-600 hover:text-blue-700 py-2"
                                >
                                    View all {client._count.invoices} invoices →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Client Portal */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Client Portal</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Generate a secure link for your client to view projects, approve deliverables, and pay invoices.
                        </p>
                    </div>
                    <GeneratePortalLink clientId={client.id} existingToken={client.portalToken} />
                </div>
            </div>
        </div>
    )
}
