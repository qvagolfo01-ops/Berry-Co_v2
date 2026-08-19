import type { OrderItem } from '@/types/database'
import type { OrderWithShipping } from '@/lib/data/orders'

export default function OrderPrintDocument({
  order,
  items,
  variant,
}: {
  order: OrderWithShipping
  items: OrderItem[]
  variant: 'invoice' | 'packing-slip'
}) {
  return (
    <div className="mx-auto max-w-2xl bg-white p-10 text-stone-900 print:p-0">
      <div className="mb-8 flex items-start justify-between border-b border-stone-200 pb-6">
        <div>
          <p className="text-2xl font-black tracking-tight text-[#d9483a]">Berry Co.</p>
          <p className="text-xs uppercase tracking-wide text-stone-400">
            {variant === 'invoice' ? 'Invoice' : 'Packing Slip'}
          </p>
        </div>
        <div className="text-right text-sm text-stone-500">
          <p className="font-medium text-stone-900">{order.order_number}</p>
          <p>{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-stone-400">
            {variant === 'invoice' ? 'Bill To' : 'Ship To'}
          </p>
          <p className="font-medium text-stone-900">{order.customer_name}</p>
          {order.customer_email && <p className="text-stone-500">{order.customer_email}</p>}
          {order.shipping_address && (
            <p className="whitespace-pre-line text-stone-500">{order.shipping_address}</p>
          )}
        </div>
        {variant === 'invoice' && (
          <div className="text-right">
            <p className="mb-1 text-xs uppercase tracking-wide text-stone-400">Payment Status</p>
            <p className="font-medium capitalize text-stone-900">{order.payment_status}</p>
          </div>
        )}
      </div>

      <table className="mb-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stone-300 text-xs uppercase tracking-wide text-stone-400">
            <th className="py-2 font-medium">Item</th>
            <th className="py-2 text-right font-medium">Qty</th>
            {variant === 'invoice' && (
              <>
                <th className="py-2 text-right font-medium">Price</th>
                <th className="py-2 text-right font-medium">Subtotal</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="py-2">{item.product_name}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              {variant === 'invoice' && (
                <>
                  <td className="py-2 text-right">₱{Number(item.price).toLocaleString()}</td>
                  <td className="py-2 text-right">
                    ₱{(Number(item.price) * item.quantity).toLocaleString()}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {variant === 'invoice' && (
        <div className="flex justify-end">
          <div className="w-48 space-y-1 text-sm">
            <div className="flex justify-between font-semibold text-stone-900">
              <span>Total</span>
              <span>₱{Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <p className="mt-10 text-center text-xs text-stone-400">Thank you for shopping with Berry Co.</p>
    </div>
  )
}