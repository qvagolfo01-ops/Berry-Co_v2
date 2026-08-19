import { AlertTriangle, Boxes, PackageX, Wallet } from 'lucide-react'
import { getInventory, getInventorySummary } from '@/lib/data/inventory'
import InventoryTable from '@/components/admin/inventory/inventory-table'
import StatCard from '@/components/admin/stat-card'
import type { ProductStatus } from '@/types/database'

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: ProductStatus }>
}) {
  const { search, status } = await searchParams

  const [products, summary] = await Promise.all([
    getInventory({ search, status }),
    getInventorySummary(),
  ])

  const lowStockItems = products.filter((p) => p.status !== 'active').slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Inventory</h1>
        <p className="text-sm text-stone-500">Track stock levels across your catalog.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Units in Stock"
          value={summary.totalUnitsInStock}
          icon={Boxes}
          tone="emerald"
        />
        <StatCard
          label="Inventory Value"
          value={`₱${summary.totalInventoryValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={Wallet}
          tone="rose"
        />
        <StatCard label="Low Stock" value={summary.lowStockCount} icon={AlertTriangle} tone="amber" />
        <StatCard label="Out of Stock" value={summary.outOfStockCount} icon={PackageX} tone="stone" />
      </div>

      {lowStockItems.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-amber-800">
            <AlertTriangle size={18} />
            <h2 className="font-semibold">Low Stock Alerts</h2>
          </div>
          <ul className="space-y-1 text-sm text-amber-800">
            {lowStockItems.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>{p.name}</span>
                <span className="font-medium">
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form className="flex flex-wrap gap-2" method="get">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search products…"
          className="w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm sm:w-64"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <button
          type="submit"
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
        >
          Filter
        </button>
      </form>

      <InventoryTable products={products} />
    </div>
  )
}
