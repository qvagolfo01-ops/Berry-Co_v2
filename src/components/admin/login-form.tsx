'use client'

import { useActionState } from 'react'
import { Lock, Mail } from 'lucide-react'
import { loginAdmin, type LoginState } from '@/lib/actions/auth'

const initialState: LoginState = { error: null }

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState)

  return (
    <form action={formAction} className="w-full space-y-4">
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="admin@berryco.com"
            className="w-full rounded-full border border-stone-300 bg-white py-2.5 pl-11 pr-4 text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#d9483a] focus:outline-none focus:ring-2 focus:ring-[#d9483a]/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full rounded-full border border-stone-300 bg-white py-2.5 pl-11 pr-4 text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#d9483a] focus:outline-none focus:ring-2 focus:ring-[#d9483a]/20"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
        <input
          type="checkbox"
          name="remember"
          defaultChecked
          className="h-4 w-4 rounded border-stone-300 text-[#d9483a] focus:ring-[#d9483a]/30"
        />
        Remember me
      </label>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#d9483a] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c23f32] disabled:opacity-70"
      >
        {pending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}