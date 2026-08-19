import type { TopCustomer } from '@/lib/data/reports'

export default function TopCustomersTable({ customers }: { customers: TopCustomer[] }) {
  if (customers.length === 0) {
    return <p className="text-sm text-stone-400">No orders in this period yet.</p>
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
        <tr>
          <th className="py-2 font-medium">Customer</th>
          <th className="py-2 text-right font-medium">Orders</th>
          <th className="py-2 text-right font-medium">Total Spent</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stone-100">
        {customers.map((customer) => (
          <tr key={`${customer.name}-${customer.email ?? ''}`}>
            <td className="py-2">
              <p className="font-medium text-stone-900">{customer.name}</p>
              {customer.email && <p className="text-xs text-stone-400">{customer.email}</p>}
            </td>
            <td className="py-2 text-right text-stone-600">{customer.orderCount}</td>
            <td className="py-2 text-right font-medium text-stone-900">
              ₱{customer.totalSpent.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}