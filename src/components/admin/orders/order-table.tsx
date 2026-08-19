import Link from 'next/link'
import OrderStatusBadge from './order-status-badge'
import PaymentStatusBadge from './payment-status-badge'
import type { OrderWithShipping } from '@/lib/data/orders'

export default function OrderTable({
  orders,
  page,
  pageSize,
  totalCount,
}: {
  orders: OrderWithShipping[]
  page: number
  pageSize: number
  totalCount: number
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-stone-400">
                  No orders found.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{order.order_number}</td>
                <td className="px-4 py-3 text-stone-600">
                  <p>{order.customer_name}</p>
                  {order.customer_email && (
                    <p className="text-xs text-stone-400">{order.customer_email}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-stone-900">
                  ₱{Number(order.total_amount).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">
                  <PaymentStatusBadge status={order.payment_status} />
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 border-t border-stone-200 p-3">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}`}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                p === page ? 'bg-[#d9483a] text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}