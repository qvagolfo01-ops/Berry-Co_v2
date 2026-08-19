'use client'

import { useState, useTransition } from 'react'
import { Minus, Plus } from 'lucide-react'
import { adjustStock } from '@/lib/actions/action-products'

export default function InlineStockAdjust({
  productId,
  stock,
}: {
  productId: string
  stock: number
}) {
  const [current, setCurrent] = useState(stock)
  const [isPending, startTransition] = useTransition()

  function handleAdjust(delta: number) {
    startTransition(async () => {
      const result = await adjustStock(productId, delta)
      if (typeof result?.stock === 'number') setCurrent(result.stock)
    })
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-stone-200 p-0.5">
      <button
        type="button"
        disabled={isPending || current <= 0}
        onClick={() => handleAdjust(-1)}
        className="rounded-full p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-40"
        aria-label="Remove one unit"
      >
        <Minus size={13} />
      </button>
      <span className="w-6 text-center text-xs font-medium text-stone-700">{current}</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleAdjust(1)}
        className="rounded-full p-1.5 text-stone-500 hover:bg-stone-100"
        aria-label="Add one unit"
      >
        <Plus size={13} />
      </button>
    </div>
  )
}