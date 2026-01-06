import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import ContractEditForm from '@/components/contracts/ContractEditForm'

interface EditContractPageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditContractPageProps) {
    const { id } = await params
    const contract = await prisma.contract.findUnique({
        where: { id },
        select: { name: true },
    })
    return { title: contract ? `Edit ${contract.name} | FreelancerShield` : 'Contract Not Found' }
}

export default async function EditContractPage({ params }: EditContractPageProps) {
    const { profile } = await requireAuth()
    const { id } = await params

    const contract = await prisma.contract.findUnique({
        where: { id, userId: profile.id },
    })

    if (!contract) {
        notFound()
    }

    // Can only edit draft contracts
    if (contract.status !== 'draft') {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <Link href={`/contracts/${contract.id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Contract
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Cannot Edit Contract</h1>
                    <p className="text-gray-600 mt-1">This contract has already been sent and cannot be edited.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <Link
                    href={`/contracts/${contract.id}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {contract.name}
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Contract</h1>
                <p className="text-gray-600 mt-1">Update contract details and content.</p>
            </div>
            <ContractEditForm contract={contract} />
        </div>
    )
}
