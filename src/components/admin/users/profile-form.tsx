'use client'

import { useActionState } from 'react'
import type { UserProfile } from '@/lib/data/users'

type FormState = { error: string | null; success?: boolean }

const inputClass =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm text-stone-800 focus:border-[#d9483a] focus:outline-none focus:ring-2 focus:ring-[#d9483a]/20'

export default function ProfileForm({
  action,
  user,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  user: UserProfile
}) {
  const [state, formAction, pending] = useActionState(action, { error: null })

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}
      {state.success && !state.error && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700"
        >
          Changes saved.
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-stone-700">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          defaultValue={user.full_name ?? ''}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-stone-700">
          Phone
        </label>
        <input id="phone" name="phone" defaultValue={user.phone ?? ''} className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-full bg-[#d9483a] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c23f32] disabled:opacity-70"
      >
        {pending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {pending ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}