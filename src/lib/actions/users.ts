'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentAdmin } from '@/lib/actions/auth'
import type { UserRole } from '@/types/database'

export type UserFormState = { error: string | null; success?: boolean }

/** Shared edit for both customer and admin profiles — name/phone only.
 * Bind the id first: `updateProfile.bind(null, id)`. */
export async function updateProfile(
  id: string,
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const full_name = String(formData.get('full_name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()

  if (!full_name) return { error: 'Name is required.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ full_name, phone: phone || null })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}`)
  return { error: null, success: true }
}

/** Suspend a customer — blocks sign-in without deleting their account/history. */
export async function suspendUser(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ status: 'suspended' }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}`)
  return { error: null }
}

export async function reactivateUser(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ status: 'active' }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}`)
  return { error: null }
}

export async function updateAdminRole(id: string, role: UserRole) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}`)
  return { error: null }
}

export type CreateAdminState = { error: string | null }

/**
 * Add a new admin/staff account — creates the actual login (auth.users row)
 * via the service-role Admin API, then fills in the profile that
 * handle_new_user() auto-created. Requires SUPABASE_SERVICE_ROLE_KEY.
 * Restricted to super_admins.
 */
export async function createAdminAccount(
  _prevState: CreateAdminState,
  formData: FormData
): Promise<CreateAdminState> {
  const requester = await getCurrentAdmin()
  if (requester?.profile.role !== 'super_admin') {
    return { error: 'Only a super admin can add admin accounts.' }
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const full_name = String(formData.get('full_name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const role = String(formData.get('role') ?? 'staff') as UserRole

  if (!email || !password) return { error: 'Email and password are required.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }
  if (!full_name) return { error: 'Name is required.' }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Admin client is not configured.' }
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    return { error: error?.message ?? 'Could not create the account.' }
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ full_name, phone: phone || null, role, status: 'active' })
    .eq('id', data.user.id)

  if (profileError) {
    return { error: `Account created, but the profile update failed: ${profileError.message}` }
  }

  revalidatePath('/admin/users')
  redirect(`/admin/users/${data.user.id}`)
}

/** Fully removes an admin's login + profile. Restricted to super_admins. */
export async function deleteAdminAccount(id: string) {
  const requester = await getCurrentAdmin()
  if (requester?.profile.role !== 'super_admin') {
    throw new Error('Only a super admin can delete admin accounts.')
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/users')
  redirect('/admin/users?tab=admins')
}