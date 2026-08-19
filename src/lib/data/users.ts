import { createClient } from '@/lib/supabase/server'
import { ADMIN_ROLES } from '@/types/database'
import type { Profile } from '@/types/database'

/** Profile + email. See the note in 0002_profiles_and_users.sql for why
 * email isn't on the base Profile type but is needed here. */
export interface UserProfile extends Profile {
  email: string | null
}

export async function getCustomers(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<{ users: UserProfile[]; count: number }> {
  const { search, page = 1, pageSize = 20 } = params
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error || !data) return { users: [], count: 0 }

  return { users: data as UserProfile[], count: count ?? 0 }
}

export async function getAdminAccounts(
  params: { search?: string } = {}
): Promise<UserProfile[]> {
  const { search } = params
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*')
    .in('role', ADMIN_ROLES)
    .order('created_at', { ascending: false })

  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)

  const { data, error } = await query
  if (error || !data) return []

  return data as UserProfile[]
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error || !data) return null
  return data as UserProfile
}