"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, FolderKanban, FileSignature, Loader2, AlertCircle } from 'lucide-react'

interface Client {
    id: string
    name: string
    company: string | null
}

interface Project {
    id: string
    name: string
    code: string
}

interface Template {
    id: string
    name: string
    description: string | null
    content: string
    isDefault: boolean
}

const DEFAULT_TEMPLATE = `# Service Agreement

This Service Agreement ("Agreement") is entered into between:

**Service Provider**: {{FREELANCER_NAME}}
**Client**: {{CLIENT_NAME}}

## 1. Services

The Service Provider agrees to provide the following services:

{{PROJECT_DESCRIPTION}}

## 2. Payment Terms

- Total Amount: {{PROJECT_AMOUNT}}
- Payment Schedule: As per milestones
- Late Payment Fee: 1.5% per month

## 3. Revisions

- Included Revisions: {{REVISIONS_CAP}}
- Extra Revision Fee: {{EXTRA_REVISION_FEE}}

## 4. Timeline

- Start Date: {{START_DATE}}
- End Date: {{END_DATE}}

## 5. Intellectual Property

Upon full payment, all intellectual property rights transfer to the Client.

## 6. Termination

Either party may terminate with 14 days written notice.

---

**Client Signature**: _________________________ Date: _________

**Service Provider Signature**: _________________________ Date: _________
`

export default function NewContractPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedProjectId = searchParams.get('projectId') || ''
    const preselectedClientId = searchParams.get('clientId') || ''

    const [clients, setClients] = useState<Client[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        clientId: preselectedClientId,
        projectId: preselectedProjectId,
        name: '',
        content: DEFAULT_TEMPLATE,
        templateId: '',
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, projectsRes, templatesRes] = await Promise.all([
                    fetch('/api/clients'),
                    fetch('/api/projects'),
                    fetch('/api/contracts/templates'),
                ])

                if (clientsRes.ok) setClients(await clientsRes.json())
                if (projectsRes.ok) setProjects(await projectsRes.json())
                if (templatesRes.ok) {
                    const templatesData = await templatesRes.json()
                    setTemplates(templatesData)
                    // If there's a default template, use it
                    const defaultTemplate = templatesData.find((t: Template) => t.isDefault)
                    if (defaultTemplate) {
                        setFormData(prev => ({ ...prev, content: defaultTemplate.content, templateId: defaultTemplate.id }))
                    }
                }
            } catch (err) {
                console.error('Failed to fetch data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Filter projects by selected client
    const filteredProjects = formData.clientId
        ? projects.filter((p: Project & { clientId?: string }) => (p as { clientId: string }).clientId === formData.clientId)
        : projects

    const handleTemplateChange = (templateId: string) => {
        const template = templates.find(t => t.id === templateId)
        if (template) {
            setFormData(prev => ({ ...prev, templateId, content: template.content }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.clientId || !formData.name || !formData.content) {
            setError('Please fill in all required fields')
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            const res = await fetch('/api/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: formData.clientId,
                    projectId: formData.projectId || null,
                    name: formData.name,
                    content: formData.content,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to create contract')
            }

            const contract = await res.json()
            router.push(`/contracts/${contract.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <Link href="/contracts" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Contracts
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">New Contract</h1>
                <p className="text-gray-600 mt-1">Create a new contract from a template.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Client & Project Selection */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value, projectId: '' }))}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    required
                                >
                                    <option value="">Select a client</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}{client.company ? ` (${client.company})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
                            <div className="relative">
                                <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={formData.projectId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    disabled={!formData.clientId}
                                >
                                    <option value="">No project</option>
                                    {filteredProjects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name} ({project.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contract Name *</label>
                            <div className="relative">
                                <FileSignature className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                                    placeholder="Service Agreement - Website Redesign"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Template Selection */}
                {templates.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Template</h3>
                        <select
                            value={formData.templateId}
                            onChange={(e) => handleTemplateChange(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                        >
                            <option value="">Use default template</option>
                            {templates.map((template) => (
                                <option key={template.id} value={template.id}>
                                    {template.name}{template.isDefault ? ' (Default)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Contract Content */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Content</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Use placeholders like {`{{CLIENT_NAME}}`}, {`{{PROJECT_AMOUNT}}`}, etc. They will be replaced when viewing.
                    </p>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        rows={20}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm"
                        placeholder="Enter contract content..."
                        required
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Contract'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
