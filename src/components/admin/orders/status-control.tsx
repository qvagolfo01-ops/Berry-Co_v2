'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/lib/actions/orders'
import type { OrderStatus } from '@/types/database'

const options: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function StatusControl({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: OrderStatus
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleChange(newStatus: OrderStatus) {
    setStatus(newStatus)
    setSaved(false)
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus)
      if (!result?.error) setSaved(true)
    })
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="mb-1 text-base font-semibold text-stone-900">Order Status</h2>
      <p className="mb-3 text-sm text-stone-500">Update as the order moves through fulfillment.</p>
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => handleChange(e.target.value as OrderStatus)}
          disabled={isPending}
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm focus:border-[#d9483a] focus:outline-none focus:ring-2 focus:ring-[#d9483a]/20"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {saved && !isPending && <span className="text-xs text-emerald-600">Saved</span>}
      </div>
    </div>
  )
}