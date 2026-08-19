import Link from 'next/link'
import { Plus } from 'lucide-react'
import { buildCategoryTree, getCategories, getProducts } from '@/lib/data/data-products'
import ProductTable from '@/components/admin/products/product-table'
import CategorySelect from '@/components/admin/products/category-select'
import type { ProductStatus } from '@/types/database'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    category?: string
    status?: ProductStatus
    page?: string
  }>
}) {
  const { search, category, status, page } = await searchParams
  const pageNum = Number(page ?? '1') || 1

  const [{ products, count }, categories] = await Promise.all([
    getProducts({ search, categoryId: category, status, page: pageNum, pageSize: 20 }),
    getCategories(),
  ])

  const categoryTree = buildCategoryTree(categories)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Products</h1>
          <p className="text-sm text-stone-500">
            {count} product{count === 1 ? '' : 's'} total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-full bg-[#d9483a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c23f32]"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search products…"
          className="w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm sm:w-64"
        />
        <CategorySelect
          categories={categoryTree}
          name="category"
          defaultValue={category}
          includeAllOption
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm"
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

      <ProductTable products={products} page={pageNum} pageSize={20} totalCount={count} />
    </div>
  )
}