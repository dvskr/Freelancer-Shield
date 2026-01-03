import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// Client signing endpoint - no auth required, uses contract code for verification
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()
        const { signature, code } = body

        if (!signature || !code) {
            return NextResponse.json({ error: 'Signature and code are required' }, { status: 400 })
        }

        // Find contract by ID and verify with code
        const contract = await prisma.contract.findUnique({
            where: { id },
        })

        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
        }

        if (contract.code !== code) {
            return NextResponse.json({ error: 'Invalid contract code' }, { status: 403 })
        }

        if (contract.status === 'signed') {
            return NextResponse.json({ error: 'Contract already signed' }, { status: 400 })
        }

        if (contract.status !== 'sent') {
            return NextResponse.json({ error: 'Contract must be sent before signing' }, { status: 400 })
        }

        // Get client IP
        const forwarded = request.headers.get('x-forwarded-for')
        const clientIp = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

        // Update contract with client signature
        const updatedContract = await prisma.contract.update({
            where: { id },
            data: {
                clientSignature: signature,
                clientSignedAt: new Date(),
                clientIp,
                status: 'signed',
            },
        })

        return NextResponse.json({
            success: true,
            signedAt: updatedContract.clientSignedAt
        })
    } catch (error) {
        console.error('Contract sign error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
