'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteProduct } from '@/lib/actions/action-products'

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Remove "${name}" from your catalog? This can't be undone.`)) return
    startTransition(() => {
      deleteProduct(id)
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
      {isPending ? 'Removing…' : 'Remove Product'}
    </button>
  )
}