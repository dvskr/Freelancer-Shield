"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Loader2, AlertCircle } from 'lucide-react'

const DEFAULT_TEMPLATE_CONTENT = `# Service Agreement

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

export default function NewTemplatePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        content: DEFAULT_TEMPLATE_CONTENT,
        isDefault: false,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim() || !formData.content.trim()) {
            setError('Name and content are required')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/contracts/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to create template')
            }

            router.push('/contracts/templates')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <Link href="/contracts/templates" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Templates
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">New Template</h1>
                <p className="text-gray-600 mt-1">Create a reusable contract template with placeholders.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                                    placeholder="Standard Service Agreement"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                                placeholder="For standard web development projects"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor="isDefault" className="text-sm text-gray-700">
                                Set as default template for new contracts
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Content</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Available placeholders: {`{{CLIENT_NAME}}`}, {`{{FREELANCER_NAME}}`}, {`{{PROJECT_DESCRIPTION}}`},
                        {`{{PROJECT_AMOUNT}}`}, {`{{REVISIONS_CAP}}`}, {`{{EXTRA_REVISION_FEE}}`}, {`{{START_DATE}}`}, {`{{END_DATE}}`}
                    </p>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        rows={20}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm"
                        placeholder="Enter template content..."
                        required
                    />
                </div>

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
                        disabled={loading}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Template'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
