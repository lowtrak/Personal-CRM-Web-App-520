import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zrrhqucjejhdayjwbszh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpycmhxdWNqZWpoZGF5andic3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzQ3ODAsImV4cCI6MjA2NzA1MDc4MH0.3Br71i_nSRorFPhNl6aYgse_Vg_vwGZUgMr8p8sjK1g'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Initialize database tables
export const initializeTables = async () => {
  try {
    // Create user_settings table
    const { error: settingsError } = await supabase.rpc('create_user_settings_table', {})
    if (settingsError && !settingsError.message.includes('already exists')) {
      console.error('Error creating user_settings table:', settingsError)
    }

    // Create activity_log table
    const { error: activityError } = await supabase.rpc('create_activity_log_table', {})
    if (activityError && !activityError.message.includes('already exists')) {
      console.error('Error creating activity_log table:', activityError)
    }
  } catch (error) {
    console.error('Error initializing tables:', error)
  }
}

export default supabase