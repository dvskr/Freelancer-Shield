import { redirect } from 'next/navigation'
import { getPortalSession, validateAccessToken, createPortalSession, setPortalSessionCookie } from '@/lib/portal/auth'
import PortalLoginForm from '@/components/portal/PortalLoginForm'

interface PortalLoginPageProps {
    searchParams: Promise<{
        token?: string
        redirect?: string
    }>
}

export const metadata = {
    title: 'Client Portal Login | FreelancerShield',
}

export default async function PortalLoginPage({ searchParams }: PortalLoginPageProps) {
    const params = await searchParams

    // Check if already logged in
    const existingSession = await getPortalSession()
    if (existingSession) {
        redirect(params.redirect || '/portal')
    }

    // Check for access token (magic link)
    if (params.token) {
        const client = await validateAccessToken(params.token)

        if (client) {
            // Create session and redirect
            const sessionToken = await createPortalSession(client.id)
            await setPortalSessionCookie(sessionToken)
            redirect(params.redirect || '/portal')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
                    <p className="text-gray-600 mt-2">
                        Access your invoices, projects, and more
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <PortalLoginForm redirectTo={params.redirect} />
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Powered by FreelancerShield
                </p>
            </div>
        </div>
    )
}
