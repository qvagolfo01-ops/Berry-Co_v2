'use client'

import { useTransition } from 'react'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import { reactivateUser, suspendUser } from '@/lib/actions/users'

export default function SuspendToggle({
  userId,
  status,
}: {
  userId: string
  status: 'active' | 'suspended'
}) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    if (status === 'active' && !confirm('Suspend this customer? They will not be able to sign in.')) {
      return
    }
    const action = status === 'active' ? suspendUser : reactivateUser
    startTransition(() => {
      action(userId)
    })
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5">
      <div>
        <h2 className="text-base font-semibold text-stone-900">Account Status</h2>
        <p className="text-sm text-stone-500">
          {status === 'active'
            ? 'This account can sign in normally.'
            : 'This account is suspended and cannot sign in.'}
        </p>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggle}
        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
          status === 'active'
            ? 'border border-red-200 text-red-600 hover:bg-red-50'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {status === 'active' ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
        {status === 'active' ? 'Suspend' : 'Reactivate'}
      </button>
    </div>
  )
}