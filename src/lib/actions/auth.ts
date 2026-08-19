'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile } from '@/types/database'

export type LoginState = {
  error: string | null
}

const ADMIN_ROLES = ['super_admin', 'admin', 'staff'] as const

/**
 * Real Supabase Auth login. Replaces the old hardcoded dev-only version —
 * same function name/signature, so no other file needs to change.
 *
 * Signs the admin in via Supabase Auth (sets the real session cookie via
 * the server client), then checks that their `profiles.role` is one of
 * super_admin/admin/staff. If not, we sign them back out immediately so a
 * plain customer account can never reach /admin.
 */
export async function loginAdmin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Enter your email and password.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: 'Incorrect email or password.' }
  }

  const { data: profile, error: profileError } = await createAdminClient()
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile) {
    await supabase.auth.signOut()
    return { error: 'No profile found for this account.' }
  }

  if (!ADMIN_ROLES.includes(profile.role as (typeof ADMIN_ROLES)[number])) {
    await supabase.auth.signOut()
    return { error: 'This account does not have admin access.' }
  }

  if (profile.status === 'suspended') {
    await supabase.auth.signOut()
    return { error: 'This account has been suspended.' }
  }

  redirect('/admin')
}

export async function logoutAdmin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

/**
 * Reads the real Supabase session (via cookies, through the server client)
 * and joins it against the profile row. Returns null if there's no
 * session, no profile, or the profile isn't an admin role — callers don't
 * need to re-check role for basic gating, though createAdminAccount /
 * deleteAdminAccount still check for super_admin specifically.
 */
export async function getCurrentAdmin(): Promise<{
  user: { id: string; email: string | null }
  profile: Profile
} | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await createAdminClient()
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) return null
  if (!ADMIN_ROLES.includes(profile.role as (typeof ADMIN_ROLES)[number])) return null

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: profile as Profile,
  }
}