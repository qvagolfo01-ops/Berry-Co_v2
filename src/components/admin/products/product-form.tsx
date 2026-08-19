'use client'

import { useActionState } from 'react'
import CategorySelect from './category-select'
import type { CategoryNode } from '@/lib/data/data-products'
import type { ProductWithCategory } from '@/types/database'

type FormState = { error: string | null }

const inputClass =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#d9483a] focus:outline-none focus:ring-2 focus:ring-[#d9483a]/20'

export default function ProductForm({
  action,
  categories,
  product,
  submitLabel = 'Save',
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  categories: CategoryNode[]
  product?: ProductWithCategory
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState(action, { error: null })

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-stone-700">
            Product name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="category_id" className="mb-1.5 block text-sm font-medium text-stone-700">
            Category
          </label>
          <CategorySelect
            categories={categories}
            defaultValue={product?.category_id ?? undefined}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="sku" className="mb-1.5 block text-sm font-medium text-stone-700">
            SKU
          </label>
          <input
            id="sku"
            name="sku"
            defaultValue={product?.sku ?? ''}
            placeholder={product ? undefined : 'Leave blank to auto-generate'}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-stone-700">
            Price (₱)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
            className={inputClass}
          />
        </div>

        {!product && (
          <div>
            <label htmlFor="stock" className="mb-1.5 block text-sm font-medium text-stone-700">
              Starting stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              defaultValue={0}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label
            htmlFor="low_stock_threshold"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Low stock alert at
          </label>
          <input
            id="low_stock_threshold"
            name="low_stock_threshold"
            type="number"
            min="0"
            defaultValue={product?.low_stock_threshold ?? 5}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="image_url" className="mb-1.5 block text-sm font-medium text-stone-700">
            Image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            defaultValue={product?.image_url ?? ''}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-stone-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product?.description ?? ''}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-full bg-[#d9483a] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c23f32] disabled:opacity-70"
      >
        {pending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}