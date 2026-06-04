import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getUserKey(): string {
  if (typeof window === 'undefined') return ''
  let key = localStorage.getItem('iyaiya_user_key')
  if (!key) {
    key = crypto.randomUUID()
    localStorage.setItem('iyaiya_user_key', key)
  }
  return key
}
