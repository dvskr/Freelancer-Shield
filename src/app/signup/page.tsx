import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignUpForm from '@/components/auth/signup-form'
import { getCurrentUser } from '@/lib/auth'

export const metadata = {
    title: 'Start Free Trial | FreelancerShield',
    description: 'Create your FreelancerShield account and start your 14-day free trial',
}

export default async function SignUpPage() {
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
                    Start your free trial
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    14 days free. No credit card required.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                    <SignUpForm />
                </div>
            </div>
        </div>
    )
}
