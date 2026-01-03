import { Metadata } from 'next'

interface SEOProps {
    title: string
    description?: string
    keywords?: string[]
    ogImage?: string
    noIndex?: boolean
}

export function generateSEO({
    title,
    description = 'Freelancer payment and project management made simple. Manage clients, projects, invoices, and time tracking in one place.',
    keywords = ['freelancer', 'invoicing', 'project management', 'time tracking', 'payments'],
    ogImage = '/og-image.png',
    noIndex = false,
}: SEOProps): Metadata {
    const fullTitle = title === 'FreelancerShield' ? title : `${title} | FreelancerShield`

    return {
        title: fullTitle,
        description,
        keywords: keywords.join(', '),
        authors: [{ name: 'FreelancerShield' }],
        openGraph: {
            title: fullTitle,
            description,
            type: 'website',
            locale: 'en_US',
            url: 'https://freelancershield.com',
            siteName: 'FreelancerShield',
            images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [ogImage],
        },
        robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    }
}
