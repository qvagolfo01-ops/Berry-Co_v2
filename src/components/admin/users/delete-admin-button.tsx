'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteAdminAccount } from '@/lib/actions/users'

export default function DeleteAdminButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (
      !confirm(`Delete "${name}"'s admin account? This removes their login entirely and can't be undone.`)
    ) {
      return
    }
    startTransition(() => {
      deleteAdminAccount(id)
    })
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
    >
      <Trash2 size={14} />
      {isPending ? 'Deleting…' : 'Delete Admin Account'}
    </button>
  )
}