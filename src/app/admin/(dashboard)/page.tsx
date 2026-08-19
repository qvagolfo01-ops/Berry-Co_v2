import { AlertTriangle, Package, ShoppingCart, Users, Wallet } from 'lucide-react'
import {
  getDashboardStats,
  getLowStockProducts,
  getNewCustomersThisWeek,
  getPendingOrdersCount,
} from '@/lib/data/dashboard'
import StatCard from '@/components/admin/stat-card'
import UpdatesCarousel from '@/components/admin/updates-carousel'

export default async function AdminDashboardPage() {
  const [stats, lowStock, pendingOrders, newCustomers] = await Promise.all([
    getDashboardStats(),
    getLowStockProducts(3),
    getPendingOrdersCount(),
    getNewCustomersThisWeek(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-500">Overview of your store&apos;s activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue (30 days)"
          value={`₱${stats.revenueLast30Days.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={Wallet}
          tone="rose"
        />
        <StatCard
          label="Orders Today"
          value={stats.ordersToday}
          icon={ShoppingCart}
          tone="amber"
          hint={`${pendingOrders} awaiting fulfillment`}
        />
        <StatCard
          label="Products"
          value={stats.totalProducts}
          icon={Package}
          tone="emerald"
          hint={`${stats.lowStockItems} low stock`}
        />
        <StatCard
          label="New Customers"
          value={newCustomers}
          icon={Users}
          tone="stone"
          hint="this week"
        />
      </div>

      {stats.lowStockItems > 0 && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <AlertTriangle size={18} />
          <span>
            {stats.lowStockItems} product{stats.lowStockItems === 1 ? '' : 's'} running low on
            stock. Check the Inventory page.
          </span>
        </div>
      )}

      <UpdatesCarousel
        lowStock={lowStock.map((p) => ({ name: p.name, stock: p.stock }))}
        pendingOrders={pendingOrders}
        revenueLast30Days={stats.revenueLast30Days}
        newCustomersThisWeek={newCustomers}
      />
    </div>
  )
}