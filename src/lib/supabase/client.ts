import { createBrowserClient } from '@supabase/ssr'

// TEMPORARY HARDCODE - Remove after debugging env issues
const SUPABASE_URL = 'https://jjdimrrnonaptfblkmbg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZGltcnJub25hcHRmYmxrbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNjA0ODUsImV4cCI6MjA4MjczNjQ4NX0.X2iWaq8oX8AeKc_4heaeaTaSsBqkDKox1mZ7g7mKrHw'

export function createClient() {
    console.log('Supabase URL (hardcoded):', SUPABASE_URL);
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
