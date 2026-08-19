import { Clock, Package, ShoppingCart, Wallet } from 'lucide-react'
import { getOrders, getOrderSummary } from '@/lib/data/orders'
import OrderTable from '@/components/admin/orders/order-table'
import StatCard from '@/components/admin/stat-card'
import type { OrderStatus, PaymentStatus } from '@/types/database'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: OrderStatus
    payment?: PaymentStatus
    page?: string
  }>
}) {
  const { search, status, payment, page } = await searchParams
  const pageNum = Number(page ?? '1') || 1

  const [{ orders, count }, summary] = await Promise.all([
    getOrders({ search, status, paymentStatus: payment, page: pageNum, pageSize: 20 }),
    getOrderSummary(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Orders</h1>
        <p className="text-sm text-stone-500">
          {count} order{count === 1 ? '' : 's'} total
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={summary.totalOrders} icon={ShoppingCart} tone="stone" />
        <StatCard label="Pending" value={summary.pendingCount} icon={Clock} tone="amber" />
        <StatCard label="Processing" value={summary.processingCount} icon={Package} tone="emerald" />
        <StatCard
          label="Revenue"
          value={`₱${summary.totalRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={Wallet}
          tone="rose"
        />
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search order #, name, email…"
          className="w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm sm:w-64"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          name="payment"
          defaultValue={payment ?? ''}
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm"
        >
          <option value="">All payments</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
        <button
          type="submit"
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
        >
          Filter
        </button>
      </form>

      <OrderTable orders={orders} page={pageNum} pageSize={20} totalCount={count} />
    </div>
  )
}