import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import StripeConnectSettings from '@/components/settings/StripeConnectSettings'
import BalanceDisplay from '@/components/payments/BalanceDisplay'
import prisma from '@/lib/prisma'

export const metadata = {
    title: 'Payment Settings | FreelancerShield',
}

export default async function PaymentSettingsPage() {
    const { profile } = await requireAuth()

    const user = await prisma.user.findUnique({
        where: { id: profile.id },
        select: {
            stripeAccountId: true,
            stripeChargesEnabled: true,
        },
    })

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Link
                    href="/settings"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Settings
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
                <p className="text-gray-600 mt-1">
                    Manage your Stripe account and view your earnings.
                </p>
            </div>

            <StripeConnectSettings />

            {user?.stripeChargesEnabled && (
                <BalanceDisplay />
            )}
        </div>
    )
}
