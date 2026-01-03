import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// TEMPORARY HARDCODE - Remove after debugging env issues
const SUPABASE_URL = 'https://jjdimrrnonaptfblkmbg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZGltcnJub25hcHRmYmxrbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNjA0ODUsImV4cCI6MjA4MjczNjQ4NX0.X2iWaq8oX8AeKc_4heaeaTaSsBqkDKox1mZ7g7mKrHw'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // Server Component - can be ignored
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // Server Component - can be ignored
                    }
                },
            },
        }
    )
}
