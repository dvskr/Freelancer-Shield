import { redirect } from 'next/navigation'
import Link from 'next/link'
import LoginForm from '@/components/auth/login-form'
import { getCurrentUser } from '@/lib/auth'

export const metadata = {
    title: 'Sign In | FreelancerShield',
    description: 'Sign in to your FreelancerShield account',
}

export default async function LoginPage() {
    const currentUser = await getCurrentUser()
    if (currentUser) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center">
                    <span className="text-3xl font-bold text-blue-600">FreelancerShield</span>
                </Link>
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Manage your projects, invoices, and clients
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}
