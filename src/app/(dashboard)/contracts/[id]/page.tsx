import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Send, CheckCircle, Clock, Eye, Building2, Mail, Copy } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate, formatDateTime } from '@/lib/utils'
import ContractActions from '@/components/contracts/ContractActions'

interface ContractDetailPageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ContractDetailPageProps) {
    const { id } = await params
    const contract = await prisma.contract.findUnique({
        where: { id },
        select: { name: true },
    })
    return { title: contract ? `${contract.name} | FreelancerShield` : 'Contract Not Found' }
}

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
    const { profile } = await requireAuth()
    const { id } = await params

    const contract = await prisma.contract.findUnique({
        where: { id, userId: profile.id },
        include: {
            client: true,
            project: { select: { id: true, name: true, code: true } },
        },
    })

    if (!contract) {
        notFound()
    }

    const getStatusInfo = () => {
        switch (contract.status) {
            case 'signed':
                return {
                    icon: <CheckCircle className="w-5 h-5" />,
                    color: 'bg-green-100 text-green-700 border-green-200',
                    label: 'Signed'
                }
            case 'sent':
                return {
                    icon: <Send className="w-5 h-5" />,
                    color: 'bg-blue-100 text-blue-700 border-blue-200',
                    label: 'Sent - Awaiting Signature'
                }
            case 'viewed':
                return {
                    icon: <Eye className="w-5 h-5" />,
                    color: 'bg-purple-100 text-purple-700 border-purple-200',
                    label: 'Viewed by Client'
                }
            default:
                return {
                    icon: <Clock className="w-5 h-5" />,
                    color: 'bg-gray-100 text-gray-700 border-gray-200',
                    label: 'Draft'
                }
        }
    }

    const statusInfo = getStatusInfo()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link href="/contracts" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Contracts
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{contract.name}</h1>
                    <p className="text-gray-500 mt-1">Code: {contract.code}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                    </span>
                    {contract.status === 'draft' && (
                        <Link
                            href={`/contracts/${contract.id}/edit`}
                            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contract Content Preview */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Content</h2>
                        <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm">
                                {contract.content}
                            </pre>
                        </div>
                    </div>

                    {/* Signature Status */}
                    {(contract.freelancerSignedAt || contract.clientSignedAt) && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Signatures</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Freelancer Signature */}
                                <div className={`p-4 rounded-lg border ${contract.freelancerSignedAt ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Service Provider</p>
                                    {contract.freelancerSignedAt ? (
                                        <>
                                            <p className="text-lg font-signature text-gray-900">{contract.freelancerSignature}</p>
                                            <p className="text-xs text-gray-500 mt-2">Signed {formatDateTime(contract.freelancerSignedAt)}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">Not signed yet</p>
                                    )}
                                </div>

                                {/* Client Signature */}
                                <div className={`p-4 rounded-lg border ${contract.clientSignedAt ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Client</p>
                                    {contract.clientSignedAt ? (
                                        <>
                                            <p className="text-lg font-signature text-gray-900">{contract.clientSignature}</p>
                                            <p className="text-xs text-gray-500 mt-2">Signed {formatDateTime(contract.clientSignedAt)}</p>
                                            {contract.clientIp && (
                                                <p className="text-xs text-gray-400">IP: {contract.clientIp}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">Awaiting client signature</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Actions */}
                    <ContractActions
                        contractId={contract.id}
                        contractCode={contract.code}
                        status={contract.status}
                        freelancerSignedAt={contract.freelancerSignedAt}
                    />

                    {/* Client Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Client</h2>
                        <Link
                            href={`/clients/${contract.client.id}`}
                            className="flex items-center gap-3 p-3 -m-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-lg">
                                    {contract.client.name.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{contract.client.name}</p>
                                {contract.client.company && (
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {contract.client.company}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {contract.client.email}
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Project Info */}
                    {contract.project && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project</h2>
                            <Link
                                href={`/projects/${contract.project.id}`}
                                className="block p-3 -m-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <p className="font-medium text-gray-900">{contract.project.name}</p>
                                <p className="text-sm text-gray-500">{contract.project.code}</p>
                            </Link>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created</span>
                                <span className="text-gray-900">{formatDate(contract.createdAt)}</span>
                            </div>
                            {contract.sentAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Sent</span>
                                    <span className="text-gray-900">{formatDateTime(contract.sentAt)}</span>
                                </div>
                            )}
                            {contract.viewedAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Viewed</span>
                                    <span className="text-gray-900">{formatDateTime(contract.viewedAt)}</span>
                                </div>
                            )}
                            {contract.clientSignedAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Signed</span>
                                    <span className="text-gray-900">{formatDateTime(contract.clientSignedAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
