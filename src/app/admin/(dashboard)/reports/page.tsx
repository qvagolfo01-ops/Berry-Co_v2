import Link from 'next/link'
import { DollarSign, Receipt, Repeat, ShoppingBag, Undo2, UserPlus, Users } from 'lucide-react'
import {
  getCustomerGrowthTrend,
  getCustomerInsights,
  getOrderStatusBreakdown,
  getRevenueByCategory,
  getRevenueTrend,
  getSalesSummary,
  getTopCustomers,
  getTopProducts,
} from '@/lib/data/reports'
import StatCard from '@/components/admin/stat-card'
import TrendChart from '@/components/admin/reports/trend-chart'
import BreakdownList from '@/components/admin/reports/breakdown-list'
import TopCustomersTable from '@/components/admin/reports/top-customers-table'

const RANGE_OPTIONS = [7, 30, 90]

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range } = await searchParams
  const days = RANGE_OPTIONS.includes(Number(range)) ? Number(range) : 30

  const [
    sales,
    revenueTrend,
    statusBreakdown,
    topProducts,
    categoryRevenue,
    customerInsights,
    customerGrowth,
    topCustomers,
  ] = await Promise.all([
    getSalesSummary(days),
    getRevenueTrend(days),
    getOrderStatusBreakdown(days),
    getTopProducts(days, 5),
    getRevenueByCategory(days),
    getCustomerInsights(days),
    getCustomerGrowthTrend(days),
    getTopCustomers(days, 5),
  ])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Reports</h1>
          <p className="text-sm text-stone-500">Sales, product performance, and customer insights.</p>
        </div>
        <div className="flex w-fit gap-1 rounded-full border border-stone-200 bg-white p-1">
          {RANGE_OPTIONS.map((d) => (
            <Link
              key={d}
              href={`/admin/reports?range=${d}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                days === d ? 'bg-[#f6e3c9] text-[#a83324]' : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              {d} days
            </Link>
          ))}
        </div>
      </div>

      {/* Sales & Revenue */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-stone-900">Sales &amp; Revenue</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={`₱${sales.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            tone="rose"
          />
          <StatCard label="Orders" value={sales.totalOrders} icon={ShoppingBag} tone="amber" />
          <StatCard
            label="Avg. Order Value"
            value={`₱${sales.averageOrderValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}`}
            icon={Receipt}
            tone="emerald"
          />
          <StatCard
            label="Refunded"
            value={`₱${sales.totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={Undo2}
            tone="stone"
          />
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-stone-900">Revenue Trend</h3>
          <TrendChart data={revenueTrend} formatValue={(v) => `₱${v.toLocaleString()}`} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-stone-900">Orders by Status</h3>
            <BreakdownList items={statusBreakdown} />
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-stone-900">Revenue by Category</h3>
            <BreakdownList items={categoryRevenue} barClassName="bg-[#a97a2e]" />
          </div>
        </div>
      </section>

      {/* Product Performance */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-stone-900">Product Performance</h2>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-stone-900">Top Selling Products</h3>
          <BreakdownList items={topProducts} barClassName="bg-emerald-600" />
        </div>
      </section>

      {/* Customer Insights */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-stone-900">Customer Insights</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Customers" value={customerInsights.totalCustomers} icon={Users} tone="stone" />
          <StatCard
            label="New Customers"
            value={customerInsights.newCustomers}
            icon={UserPlus}
            tone="emerald"
            hint={`in the last ${days} days`}
          />
          <StatCard
            label="Repeat Customer Rate"
            value={`${Math.round(customerInsights.repeatCustomerRate * 100)}%`}
            icon={Repeat}
            tone="amber"
          />
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-stone-900">New Customers Over Time</h3>
          <TrendChart data={customerGrowth} barClassName="bg-emerald-500/70 hover:bg-emerald-600" />
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-stone-900">Top Customers</h3>
          <TopCustomersTable customers={topCustomers} />
        </div>
      </section>
    </div>
  )
}