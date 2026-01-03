import { NextResponse } from 'next/server'

export class APIError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message)
        this.name = 'APIError'
    }
}

export function handleAPIError(error: unknown) {
    console.error('API Error:', error)

    if (error instanceof APIError) {
        return NextResponse.json(
            { error: error.message, code: error.code },
            { status: error.statusCode }
        )
    }

    if (error instanceof Error) {
        // Prisma errors
        if (error.message.includes('Unique constraint')) {
            return NextResponse.json(
                { error: 'This record already exists', code: 'DUPLICATE' },
                { status: 409 }
            )
        }

        if (error.message.includes('Record to update not found')) {
            return NextResponse.json(
                { error: 'Record not found', code: 'NOT_FOUND' },
                { status: 404 }
            )
        }

        // Generic error
        return NextResponse.json(
            { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }

    return NextResponse.json(
        { error: 'An unexpected error occurred', code: 'UNKNOWN' },
        { status: 500 }
    )
}
