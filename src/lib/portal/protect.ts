import { redirect } from 'next/navigation'
import { getPortalSession } from './auth'

export async function requirePortalAuth() {
    const session = await getPortalSession()

    if (!session) {
        redirect('/portal/login')
    }

    return {
        session,
        client: session.client,
        freelancer: session.client.user,
    }
}
