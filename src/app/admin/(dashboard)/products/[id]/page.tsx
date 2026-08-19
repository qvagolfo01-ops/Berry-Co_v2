import { notFound } from 'next/navigation'
import { buildCategoryTree, getCategories, getProductById } from '@/lib/data/data-products'
import { updateProduct } from '@/lib/actions/action-products'
import ProductForm from '@/components/admin/products/product-form'
import StockAdjust from '@/components/admin/products/stock-adjust'
import DeleteProductButton from '@/components/admin/products/delete-product-button'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories] = await Promise.all([getProductById(id), getCategories()])

  if (!product) notFound()

  const categoryTree = buildCategoryTree(categories)
  const boundUpdate = updateProduct.bind(null, id)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">{product.name}</h1>
        <p className="text-sm text-stone-500">SKU: {product.sku}</p>
      </div>

      <StockAdjust product={product} action={boundUpdate} categories={categoryTree} />

      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-stone-900">Product Details</h2>
        <ProductForm
          action={boundUpdate}
          categories={categoryTree}
          product={product}
          submitLabel="Save Changes"
        />
      </div>

      <DeleteProductButton id={product.id} name={product.name} />
    </div>
  )
}