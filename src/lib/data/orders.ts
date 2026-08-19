import { createClient } from '@/lib/supabase/server'
import type { Order, OrderItem, OrderStatus, PaymentStatus } from '@/types/database'

/** Order + the extra columns from the migration (see 0003_orders.sql notes). */
export interface OrderWithShipping extends Order {
  shipping_address: string | null
}

export interface OrderRefund {
  id: string
  order_id: string
  amount: number
  reason: string | null
  created_at: string
}

export async function getOrders(
  params: {
    search?: string
    status?: OrderStatus
    paymentStatus?: PaymentStatus
    page?: number
    pageSize?: number
  } = {}
): Promise<{ orders: OrderWithShipping[]; count: number }> {
  const { search, status, paymentStatus, page = 1, pageSize = 20 } = params
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(
      `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`
    )
  }
  if (status) query = query.eq('status', status)
  if (paymentStatus) query = query.eq('payment_status', paymentStatus)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error || !data) return { orders: [], count: 0 }

  return { orders: data as OrderWithShipping[], count: count ?? 0 }
}

export async function getOrderById(
  id: string
): Promise<{ order: OrderWithShipping; items: OrderItem[] } | null> {
  const supabase = await createClient()

  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single()
  if (error || !order) return null

  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id)

  return { order: order as OrderWithShipping, items: (items ?? []) as OrderItem[] }
}

export async function getOrderRefunds(orderId: string): Promise<OrderRefund[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('order_refunds')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as OrderRefund[]
}

export interface OrderSummary {
  totalOrders: number
  pendingCount: number
  processingCount: number
  totalRevenue: number
}

/** Powers the four stat cards at the top of the Orders list page. */
export async function getOrderSummary(): Promise<OrderSummary> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('orders').select('status, total_amount')

  if (error || !data) {
    return { totalOrders: 0, pendingCount: 0, processingCount: 0, totalRevenue: 0 }
  }

  let pendingCount = 0
  let processingCount = 0
  let totalRevenue = 0

  for (const o of data) {
    if (o.status === 'pending') pendingCount++
    if (o.status === 'processing') processingCount++
    if (o.status !== 'cancelled') totalRevenue += Number(o.total_amount)
  }

  return { totalOrders: data.length, pendingCount, processingCount, totalRevenue }
}