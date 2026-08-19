import { createClient } from '@/lib/supabase/server'
import type { DashboardStats, Product } from '@/types/database'

/** Powers the four stat cards at the top of the dashboard. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    { count: totalProducts },
    { count: ordersToday },
    { data: recentOrders },
    { data: products },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfToday.toISOString()),
    supabase
      .from('orders')
      .select('total_amount, status')
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('products').select('stock, low_stock_threshold'),
  ])

  const revenueLast30Days = (recentOrders ?? [])
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount), 0)

  const lowStockItems = (products ?? []).filter((p) => p.stock <= p.low_stock_threshold).length

  return {
    totalProducts: totalProducts ?? 0,
    ordersToday: ordersToday ?? 0,
    lowStockItems,
    revenueLast30Days,
  }
}

/** Feeds the "Inventory Report" slide in the updates carousel. */
export async function getLowStockProducts(
  limit = 3
): Promise<Pick<Product, 'id' | 'name' | 'stock'>[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock, low_stock_threshold')
    .order('stock', { ascending: true })
    .limit(20)

  if (error || !data) return []
  return data.filter((p) => p.stock <= p.low_stock_threshold).slice(0, limit)
}

/** Feeds the "New Orders" slide — orders not yet shipped/delivered/cancelled. */
export async function getPendingOrdersCount(): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'processing'])

  return count ?? 0
}

/** Feeds the "User Activity" slide. */
export async function getNewCustomersThisWeek(): Promise<number> {
  const supabase = await createClient()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')
    .gte('created_at', sevenDaysAgo.toISOString())

  return count ?? 0
}