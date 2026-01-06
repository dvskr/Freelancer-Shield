import Link from 'next/link'
import { Users, ArrowLeft } from 'lucide-react'

export default function ClientNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Not Found</h2>
            <p className="text-gray-500 mb-6 max-w-md">
                The client you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link
                href="/clients"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Clients
            </Link>
        </div>
    )
}
