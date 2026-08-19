import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/data/data-products'
import type { Product, ProductStatus, ProductWithCategory } from '@/types/database'

export interface InventorySummary {
  totalProducts: number
  totalUnitsInStock: number
  totalInventoryValue: number
  lowStockCount: number
  outOfStockCount: number
}

/** All products, sorted stock-ascending so the neediest items surface first. */
export async function getInventory(
  params: { search?: string; status?: ProductStatus } = {}
): Promise<ProductWithCategory[]> {
  const { search, status } = params
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*')
    .order('stock', { ascending: true })
    .limit(500)

  if (search) query = query.ilike('name', `%${search}%`)

  const [{ data, error }, categories] = await Promise.all([query, getCategories()])
  if (error || !data) return []

  const categoriesById = new Map(categories.map((c) => [c.id, c]))
  // toProductWithCategory isn't exported from data-products; do simple local mapping
  let products = (data as Product[]).map((p) => {
    const category = categoriesById.get((p as any).category_id) ?? null
    return { ...(p as any), category } as unknown as ProductWithCategory
  })

  if (status) products = products.filter((p) => p.status === status)

  return products
}

/** Powers the four summary cards at the top of the Inventory page. */
export async function getInventorySummary(): Promise<InventorySummary> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('price, stock, low_stock_threshold')

  if (error || !data) {
    return {
      totalProducts: 0,
      totalUnitsInStock: 0,
      totalInventoryValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    }
  }

  let totalUnitsInStock = 0
  let totalInventoryValue = 0
  let lowStockCount = 0
  let outOfStockCount = 0

  for (const p of data) {
    totalUnitsInStock += p.stock
    totalInventoryValue += p.stock * Number(p.price)
    if (p.stock <= 0) outOfStockCount++
    else if (p.stock <= p.low_stock_threshold) lowStockCount++
  }

  return {
    totalProducts: data.length,
    totalUnitsInStock,
    totalInventoryValue,
    lowStockCount,
    outOfStockCount,
  }
}