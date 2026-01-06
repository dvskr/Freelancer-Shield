import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set - emails will not be sent')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const emailConfig = {
    from: `${process.env.EMAIL_FROM_NAME || 'FreelancerShield'} <${process.env.EMAIL_FROM_ADDRESS || 'noreply@freelancershield.com'}>`,
    replyTo: process.env.EMAIL_REPLY_TO,
}

export interface SendEmailOptions {
    to: string | string[]
    subject: string
    html: string
    text?: string
    replyTo?: string
    tags?: { name: string; value: string }[]
}

export async function sendEmail(options: SendEmailOptions) {
    if (!process.env.RESEND_API_KEY) {
        console.log('Email skipped (no API key):', options.subject)
        return { success: false, error: 'No API key configured' }
    }

    try {
        const result = await resend.emails.send({
            from: emailConfig.from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            replyTo: options.replyTo || emailConfig.replyTo,
            tags: options.tags,
        })

        if (result.error) {
            console.error('Email send error:', result.error)
            return { success: false, error: result.error.message }
        }

        return { success: true, id: result.data?.id }
    } catch (error) {
        console.error('Email send failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

export async function sendBatchEmails(emails: SendEmailOptions[]) {
    const results = await Promise.allSettled(
        emails.map(email => sendEmail(email))
    )

    return results.map((result, index) => ({
        email: emails[index].to,
        success: result.status === 'fulfilled' && result.value.success,
        error: result.status === 'rejected'
            ? result.reason
            : result.status === 'fulfilled' && !result.value.success
                ? result.value.error
                : null,
    }))
}
