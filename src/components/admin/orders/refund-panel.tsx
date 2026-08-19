'use client'

import { useActionState } from 'react'
import { processRefund, type RefundState } from '@/lib/actions/orders'
import type { OrderRefund } from '@/lib/data/orders'

const inputClass =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm text-stone-800 focus:border-[#d9483a] focus:outline-none focus:ring-2 focus:ring-[#d9483a]/20'

export default function RefundPanel({
  orderId,
  totalAmount,
  paymentStatus,
  refunds,
}: {
  orderId: string
  totalAmount: number
  paymentStatus: string
  refunds: OrderRefund[]
}) {
  const boundAction = processRefund.bind(null, orderId)
  const [state, formAction, pending] = useActionState<RefundState, FormData>(boundAction, {
    error: null,
  })

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="mb-1 text-base font-semibold text-stone-900">Returns &amp; Refunds</h2>
      <p className="mb-4 text-sm text-stone-500">
        {paymentStatus === 'refunded'
          ? 'This order has been refunded.'
          : 'Process a refund for a return or cancellation.'}
      </p>

      {refunds.length > 0 && (
        <ul className="mb-4 space-y-1.5 rounded-xl bg-stone-50 p-3 text-sm text-stone-600">
          {refunds.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3">
              <span className="truncate">{r.reason ?? 'No reason given'}</span>
              <span className="whitespace-nowrap font-medium text-stone-900">
                ₱{Number(r.amount).toLocaleString()} · {new Date(r.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      {state.error && (
        <div
          role="alert"
          className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}
      {state.success && !state.error && (
        <div
          role="status"
          className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700"
        >
          Refund recorded.
        </div>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <div className="min-w-[140px] flex-1">
          <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-stone-700">
            Amount (₱)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={totalAmount}
            defaultValue={totalAmount}
            className={inputClass}
          />
        </div>
        <div className="min-w-[180px] flex-[2]">
          <label htmlFor="reason" className="mb-1.5 block text-sm font-medium text-stone-700">
            Reason (optional)
          </label>
          <input
            id="reason"
            name="reason"
            placeholder="e.g. damaged item, wrong size"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
        >
          {pending ? 'Processing…' : 'Process Refund'}
        </button>
      </form>
    </div>
  )
}