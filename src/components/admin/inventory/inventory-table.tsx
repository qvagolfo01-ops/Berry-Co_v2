import Link from 'next/link'
import InlineStockAdjust from './inline-stock-adjust'
import type { ProductWithCategory } from '@/types/database'

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
  out_of_stock: 'bg-red-50 text-red-700 border-red-200',
}

const statusLabels: Record<string, string> = {
  active: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
}

export default function InventoryTable({ products }: { products: ProductWithCategory[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Threshold</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-stone-400">
                  No products found.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium text-stone-900 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-stone-400">{product.sku}</p>
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {product.subcategory_name ?? product.category_name ?? '—'}
                </td>
                <td className="px-4 py-3 font-medium text-stone-900">{product.stock}</td>
                <td className="px-4 py-3 text-stone-500">{product.low_stock_threshold}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      statusStyles[product.status]
                    }`}
                  >
                    {statusLabels[product.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <InlineStockAdjust productId={product.id} stock={product.stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}