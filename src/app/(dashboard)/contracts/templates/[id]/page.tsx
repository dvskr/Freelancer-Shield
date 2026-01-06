import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Star } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

interface TemplateDetailPageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TemplateDetailPageProps) {
    const { id } = await params
    const template = await prisma.contractTemplate.findUnique({
        where: { id },
        select: { name: true },
    })
    return { title: template ? `${template.name} | FreelancerShield` : 'Template Not Found' }
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
    const { profile } = await requireAuth()
    const { id } = await params

    const template = await prisma.contractTemplate.findUnique({
        where: { id, userId: profile.id },
    })

    if (!template) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <Link href="/contracts/templates" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Templates
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
                        {template.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                <Star className="w-4 h-4" />
                                Default
                            </span>
                        )}
                    </div>
                    {template.description && (
                        <p className="text-gray-600 mt-1">{template.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/contracts/templates/${template.id}/edit`}
                        className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Link>
                    <Link
                        href={`/contracts/new?templateId=${template.id}`}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Use Template
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Template Content</h2>
                    <span className="text-sm text-gray-500">Created {formatDate(template.createdAt)}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm">
                        {template.content}
                    </pre>
                </div>
            </div>
        </div>
    )
}
