"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { deliverableSchema, DeliverableFormData } from '@/lib/validations/milestone'
import {
    FileText,
    Upload,
    X,
    Loader2,
    AlertCircle,
    File,
    Image
} from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

interface DeliverableFormProps {
    projectId: string
    milestoneId: string
}

export default function DeliverableForm({ projectId, milestoneId }: DeliverableFormProps) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<DeliverableFormData>({
        resolver: zodResolver(deliverableSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    })

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB')
                return
            }
            setSelectedFile(file)
            setError(null)
        }
    }

    const removeFile = () => {
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="w-8 h-8 text-purple-500" />
        if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
        return <File className="w-8 h-8 text-blue-500" />
    }

    const onSubmit = async (data: DeliverableFormData) => {
        setLoading(true)
        setError(null)

        try {
            let fileUrl = ''
            let fileType = ''
            let fileSize = 0

            // Upload file if selected
            if (selectedFile) {
                // Upload to Supabase Storage via API
                const formData = new FormData()
                formData.append('file', selectedFile)
                formData.append('folder', 'deliverables')

                setUploadProgress(10)

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })

                setUploadProgress(60)

                if (!uploadRes.ok) {
                    const uploadError = await uploadRes.json()
                    throw new Error(uploadError.error || 'Failed to upload file')
                }

                const uploadData = await uploadRes.json()
                fileUrl = uploadData.url
                fileType = selectedFile.type
                fileSize = selectedFile.size

                setUploadProgress(100)
            }

            const res = await fetch(
                `/api/projects/${projectId}/milestones/${milestoneId}/deliverables`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...data,
                        fileUrl,
                        fileType,
                        fileSize,
                    }),
                }
            )

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to add deliverable')
            }

            router.push(`/projects/${projectId}/milestones/${milestoneId}`)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
            setUploadProgress(0)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* File Upload */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h3>

                {selectedFile ? (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {getFileIcon(selectedFile.type)}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={removeFile}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                    >
                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">Max file size: 10MB</p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                />

                {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Uploading...</span>
                            <span className="text-gray-600">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Deliverable Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deliverable Details</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                {...register('name')}
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Homepage Design v1"
                            />
                        </div>
                        {errors.name && (
                            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe what's included in this deliverable..."
                        />
                    </div>
                </div>
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
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Adding...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            Add Deliverable
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
