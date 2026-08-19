import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — SERVER-ONLY. Never import this into a
 * Client Component or anything that reaches the browser bundle. It bypasses
 * Row Level Security entirely and can manage auth.users directly (create,
 * update, delete accounts) via the Admin API — used by
 * lib/actions/users.ts to add/delete admin accounts.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in your environment (Supabase
 * Dashboard → Settings → API → service_role key). Deliberately NOT
 * prefixed with NEXT_PUBLIC_ — that prefix would ship it to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (Supabase Dashboard → Settings → API) to manage admin accounts.'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}