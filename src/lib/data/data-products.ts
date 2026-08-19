import { createClient } from '@/lib/supabase/server'
import type { Category, Product, ProductStatus, ProductWithCategory } from '@/types/database'

export interface CategoryNode extends Category {
  children: CategoryNode[]
}

/** ProductStatus isn't stored — derive it from stock so it can never drift. */
export function deriveProductStatus(stock: number, lowStockThreshold: number): ProductStatus {
  if (stock <= 0) return 'out_of_stock'
  if (stock <= lowStockThreshold) return 'low_stock'
  return 'active'
}


function toProductWithCategory(
  product: Product,
  categoriesById: Map<string, Category>
): ProductWithCategory {
  // product.category_id points at a level-2 "product type" leaf. Walk up
  // the tree to get the level-1 subcategory and level-0 category names.
  const leaf = product.category_id ? categoriesById.get(product.category_id) : undefined
  const sub = leaf?.parent_id ? categoriesById.get(leaf.parent_id) : undefined
  const top = sub?.parent_id ? categoriesById.get(sub.parent_id) : undefined

  return {
    ...product,
    category_name: top?.name ?? sub?.name ?? null,
    subcategory_name: sub?.name ?? leaf?.name ?? null,
    status: deriveProductStatus(product.stock, product.low_stock_threshold),
  }
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('level')
    .order('name')

  if (error || !data) return []
  return data as Category[]
}

/** Turns the flat categories table into a 3-level tree for cascading selects. */
export function buildCategoryTree(flat: Category[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>()
  flat.forEach((c) => byId.set(c.id, { ...c, children: [] }))

  const roots: CategoryNode[] = []
  byId.forEach((node) => {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node)
    } else if (!node.parent_id) {
      roots.push(node)
    }
  })

  return roots
}

export async function getProducts(
  params: {
    search?: string
    categoryId?: string
    status?: ProductStatus
    page?: number
    pageSize?: number
  } = {}
): Promise<{ products: ProductWithCategory[]; count: number }> {
  const { search, categoryId, status, page = 1, pageSize = 20 } = params
  const supabase = await createClient()

  // Status is derived, not a DB column, so it can't be filtered in SQL.
  // Fetch everything matching search/category (capped at 500 — plenty for
  // an admin catalog), then filter + paginate here.
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (search) query = query.ilike('name', `%${search}%`)
  if (categoryId) query = query.eq('category_id', categoryId)

  const [{ data, error }, categories] = await Promise.all([query, getCategories()])

  if (error || !data) return { products: [], count: 0 }

  const categoriesById = new Map(categories.map((c) => [c.id, c]))
  let products = (data as Product[]).map((p) => toProductWithCategory(p, categoriesById))

  if (status) products = products.filter((p) => p.status === status)

  const count = products.length
  const from = (page - 1) * pageSize
  products = products.slice(from, from + pageSize)

  return { products, count }
}

export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  const supabase = await createClient()

  const [{ data, error }, categories] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    getCategories(),
  ])

  if (error || !data) return null

  const categoriesById = new Map(categories.map((c) => [c.id, c]))
  return toProductWithCategory(data as Product, categoriesById)
}