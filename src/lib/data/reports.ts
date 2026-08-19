import { createClient } from '@/lib/supabase/server'
import { getCategories } from './data-products'
import type { OrderStatus } from '@/types/database'

function daysAgoIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/** Every day in the range, oldest first, pre-seeded at 0 so charts never
 * have gaps for days with no activity. */
function emptyDaySeries(days: number): Map<string, number> {
  const byDay = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    byDay.set(d.toISOString().slice(0, 10), 0)
  }
  return byDay
}

async function getOrderIdsInRange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  since: string
): Promise<string[]> {
  const { data } = await supabase
    .from('orders')
    .select('id')
    .gte('created_at', since)
    .neq('status', 'cancelled')

  return (data ?? []).map((o) => o.id)
}

// ===================== Sales & Revenue =====================

export interface SalesSummary {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalRefunded: number
}

export async function getSalesSummary(days: number): Promise<SalesSummary> {
  const supabase = await createClient()
  const since = daysAgoIso(days)

  const [{ data: orders }, { data: refunds }] = await Promise.all([
    supabase.from('orders').select('total_amount, status').gte('created_at', since),
    supabase.from('order_refunds').select('amount').gte('created_at', since),
  ])

  const validOrders = (orders ?? []).filter((o) => o.status !== 'cancelled')
  const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  const totalOrders = validOrders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const totalRefunded = (refunds ?? []).reduce((sum, r) => sum + Number(r.amount), 0)

  return { totalRevenue, totalOrders, averageOrderValue, totalRefunded }
}

export interface TrendPoint {
  date: string
  value: number
}

export async function getRevenueTrend(days: number): Promise<TrendPoint[]> {
  const supabase = await createClient()
  const since = daysAgoIso(days)
  const byDay = emptyDaySeries(days)

  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, status, created_at')
    .gte('created_at', since)
    .neq('status', 'cancelled')

  if (!error && data) {
    data.forEach((o) => {
      const day = o.created_at.slice(0, 10)
      if (byDay.has(day)) byDay.set(day, (byDay.get(day) ?? 0) + Number(o.total_amount))
    })
  }

  return Array.from(byDay.entries()).map(([date, value]) => ({ date, value }))
}

/** Shape used by BreakdownList — order status, top products, and revenue
 * by category all reduce down to "label / value / how to display it". */
export interface BreakdownItem {
  label: string
  value: number
  displayValue: string
}

const STATUS_ORDER: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export async function getOrderStatusBreakdown(days: number): Promise<BreakdownItem[]> {
  const supabase = await createClient()
  const since = daysAgoIso(days)

  const { data, error } = await supabase.from('orders').select('status').gte('created_at', since)
  if (error || !data) return []

  const counts = new Map<string, number>()
  data.forEach((o) => counts.set(o.status, (counts.get(o.status) ?? 0) + 1))

  return STATUS_ORDER.filter((s) => counts.has(s)).map((s) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    value: counts.get(s) ?? 0,
    displayValue: `${counts.get(s)}`,
  }))
}

// ===================== Product Performance =====================

export async function getTopProducts(days: number, limit = 5): Promise<BreakdownItem[]> {
  const supabase = await createClient()
  const since = daysAgoIso(days)

  const orderIds = await getOrderIdsInRange(supabase, since)
  if (orderIds.length === 0) return []

  const { data: items, error } = await supabase
    .from('order_items')
    .select('product_name, quantity, price')
    .in('order_id', orderIds)

  if (error || !items) return []

  const totals = new Map<string, { quantity: number; revenue: number }>()
  items.forEach((item) => {
    const entry = totals.get(item.product_name) ?? { quantity: 0, revenue: 0 }
    entry.quantity += item.quantity
    entry.revenue += Number(item.price) * item.quantity
    totals.set(item.product_name, entry)
  })

  return Array.from(totals.entries())
    .map(([label, t]) => ({
      label,
      value: t.revenue,
      displayValue: `₱${t.revenue.toLocaleString()} · ${t.quantity} sold`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

/** Revenue grouped by top-level category (Trading Card Games / Card
 * Accessories / Anime & Collectibles). Items with a deleted or missing
 * product fall under "Uncategorized". */
export async function getRevenueByCategory(days: number, limit = 6): Promise<BreakdownItem[]> {
  const supabase = await createClient()
  const since = daysAgoIso(days)

  const orderIds = await getOrderIdsInRange(supabase, since)
  if (orderIds.length === 0) return []

  const [{ data: items, error }, { data: products }, categories] = await Promise.all([
    supabase.from('order_items').select('product_id, quantity, price').in('order_id', orderIds),
    supabase.from('products').select('id, category_id'),
    getCategories(),
  ])

  if (error || !items) return []

  const categoriesById = new Map(categories.map((c) => [c.id, c]))
  const productCategoryId = new Map((products ?? []).map((p) => [p.id, p.category_id]))

  function topLevelCategoryName(productId: string | null): string {
    const leafId = productId ? productCategoryId.get(productId) : null
    if (!leafId) return 'Uncategorized'
    const leaf = categoriesById.get(leafId)
    const sub = leaf?.parent_id ? categoriesById.get(leaf.parent_id) : undefined
    const top = sub?.parent_id ? categoriesById.get(sub.parent_id) : undefined
    return top?.name ?? sub?.name ?? leaf?.name ?? 'Uncategorized'
  }

  const totals = new Map<string, number>()
  items.forEach((item) => {
    const name = topLevelCategoryName(item.product_id)
    totals.set(name, (totals.get(name) ?? 0) + Number(item.price) * item.quantity)
  })

  return Array.from(totals.entries())
    .map(([label, value]) => ({ label, value, displayValue: `₱${value.toLocaleString()}` }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

// ===================== Customer Insights =====================

export interface CustomerInsights {
  totalCustomers: number
  newCustomers: number
  repeatCustomerRate: number
}

export async function getCustomerInsights(days: number): Promise<CustomerInsights> {
  const supabase = await createClient()
  const since = daysAgoIso(days)

  const [{ count: totalCustomers }, { count: newCustomers }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gte('created_at', since),
    supabase
      .from('orders')
      .select('customer_id, customer_email')
      .gte('created_at', since)
      .neq('status', 'cancelled'),
  ])

  const buyerKey = (o: { customer_id: string | null; customer_email: string | null }) =>
    o.customer_id ?? o.customer_email ?? 'unknown'

  const orderCountsByBuyer = new Map<string, number>()
  ;(orders ?? []).forEach((o) => {
    const key = buyerKey(o)
    orderCountsByBuyer.set(key, (orderCountsByBuyer.get(key) ?? 0) + 1)
  })

  const buyers = Array.from(orderCountsByBuyer.values())
  const repeatBuyers = buyers.filter((count) => count > 1).length
  const repeatCustomerRate = buyers.length > 0 ? repeatBuyers / buyers.length : 0

  return {
    totalCustomers: totalCustomers ?? 0,
    newCustomers: newCustomers ?? 0,
    repeatCustomerRate,
  }
}

export async function getCustomerGrowthTrend(days: number): Promise<TrendPoint[]> {
  const supabase = await createClient()
  const since = daysAgoIso(days)
  const byDay = emptyDaySeries(days)

  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('role', 'customer')
    .gte('created_at', since)

  if (!error && data) {
    data.forEach((p) => {
      const day = p.created_at.slice(0, 10)
      if (byDay.has(day)) byDay.set(day, (byDay.get(day) ?? 0) + 1)
    })
  }

  return Array.from(byDay.entries()).map(([date, value]) => ({ date, value }))
}

export interface TopCustomer {
  name: string
  email: string | null
  orderCount: number
  totalSpent: number
}

export async function getTopCustomers(days: number, limit = 5): Promise<TopCustomer[]> {
  const supabase = await createClient()
  const since = daysAgoIso(days)

  const { data, error } = await supabase
    .from('orders')
    .select('customer_name, customer_email, customer_id, total_amount, status')
    .gte('created_at', since)
    .neq('status', 'cancelled')

  if (error || !data) return []

  const totals = new Map<string, TopCustomer>()
  data.forEach((o) => {
    const key = o.customer_id ?? o.customer_email ?? o.customer_name
    const existing = totals.get(key)
    if (existing) {
      existing.orderCount += 1
      existing.totalSpent += Number(o.total_amount)
    } else {
      totals.set(key, {
        name: o.customer_name,
        email: o.customer_email,
        orderCount: 1,
        totalSpent: Number(o.total_amount),
      })
    }
  })

  return Array.from(totals.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit)
}