import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { Plus, FileText, Star, Trash2 } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import TemplateActions from '@/components/contracts/TemplateActions'

export const metadata = {
    title: 'Contract Templates | FreelancerShield',
}

export default async function ContractTemplatesPage() {
    const { profile } = await requireAuth()

    const templates = await prisma.contractTemplate.findMany({
        where: { userId: profile.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contract Templates</h1>
                    <p className="text-gray-600 mt-1">Create and manage reusable contract templates</p>
                </div>
                <Link
                    href="/contracts/templates/new"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Template
                </Link>
            </div>

            {templates.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h3>
                    <p className="text-gray-500 mb-6">Create your first template to speed up contract creation.</p>
                    <Link href="/contracts/templates/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        <Plus className="w-5 h-5" />
                        Create Your First Template
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    {template.isDefault && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                            <Star className="w-3 h-3" />
                                            Default
                                        </span>
                                    )}
                                </div>
                                <TemplateActions templateId={template.id} isDefault={template.isDefault} />
                            </div>

                            <Link href={`/contracts/templates/${template.id}`}>
                                <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600">
                                    {template.name}
                                </h3>
                            </Link>

                            {template.description && (
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-500">
                                    Created {formatDate(template.createdAt)}
                                </span>
                                <Link
                                    href={`/contracts/new?templateId=${template.id}`}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Use Template
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
