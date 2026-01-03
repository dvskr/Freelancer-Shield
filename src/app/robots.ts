import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://freelancershield.com'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/dashboard/', '/clients/', '/projects/', '/invoices/', '/time/', '/analytics/', '/settings/', '/portal/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
