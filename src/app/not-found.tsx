import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
            <div className="text-center max-w-md">
                <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Page not found
                </h1>
                <p className="text-gray-600 mb-8">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for.
                    It might have been moved or deleted.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </Link>
                    <Link
                        href="javascript:history.back()"
                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-white font-medium text-gray-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Link>
                </div>
            </div>
        </div>
    )
}
