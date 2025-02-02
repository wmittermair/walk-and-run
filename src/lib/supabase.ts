import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type DbUser = {
  id: string
  email: string
  name: string
  avatar_url?: string
}

export type DbActivity = {
  id: string
  type_id: string
  value: number
  date: string
  user_id: string
  created_at: string
}

export type DbActivityType = {
  id: string
  emoji: string
  name: string
  unit: 'Kilometer' | 'Minuten'
  created_at: string
} 