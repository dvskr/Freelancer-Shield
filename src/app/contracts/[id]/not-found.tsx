import Link from 'next/link'
import { FileSignature } from 'lucide-react'

export default function ContractNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <FileSignature className="w-16 h-16 text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Contract Not Found</h1>
            <p className="text-gray-500 mb-6">The contract you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
            <Link
                href="/contracts"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
                Back to Contracts
            </Link>
        </div>
    )
}
