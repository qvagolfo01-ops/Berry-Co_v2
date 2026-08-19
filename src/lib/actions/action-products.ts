'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ProductFormState = { error: string | null }

function generateSku(name: string) {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 20)
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${base}-${suffix}`
}

/** Add a new product to the catalog. */
export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const name = String(formData.get('name') ?? '').trim()
  const price = Number(formData.get('price') ?? 0)
  const stock = Number(formData.get('stock') ?? 0)
  let sku = String(formData.get('sku') ?? '').trim()

  if (!name) return { error: 'Product name is required.' }
  if (Number.isNaN(price) || price < 0) return { error: 'Enter a valid price.' }
  if (Number.isNaN(stock) || stock < 0) return { error: 'Enter a valid starting stock.' }
  if (!sku) sku = generateSku(name)

  const supabase = await createClient()

  const payload = {
    name,
    sku,
    price,
    stock,
    low_stock_threshold: Number(formData.get('low_stock_threshold') ?? 5),
    category_id: String(formData.get('category_id') ?? '') || null,
    description: String(formData.get('description') ?? '') || null,
    image_url: String(formData.get('image_url') ?? '') || null,
  }

  const { data, error } = await supabase.from('products').insert(payload).select('id').single()

  if (error) {
    if (error.code === '23505') return { error: 'That SKU is already in use.' }
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  redirect(`/admin/products/${data.id}`)
}

/** Bind the product id first: `updateProduct.bind(null, id)`. Does not touch
 * stock — that goes through adjustStock so every change is intentional. */
export async function updateProduct(
  id: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const name = String(formData.get('name') ?? '').trim()
  const sku = String(formData.get('sku') ?? '').trim()
  const price = Number(formData.get('price') ?? 0)

  if (!name) return { error: 'Product name is required.' }
  if (!sku) return { error: 'SKU is required.' }
  if (Number.isNaN(price) || price < 0) return { error: 'Enter a valid price.' }

  const supabase = await createClient()

  const payload = {
    name,
    sku,
    price,
    low_stock_threshold: Number(formData.get('low_stock_threshold') ?? 5),
    category_id: String(formData.get('category_id') ?? '') || null,
    description: String(formData.get('description') ?? '') || null,
    image_url: String(formData.get('image_url') ?? '') || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('products').update(payload).eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'That SKU is already in use.' }
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}`)
  return { error: null }
}

/** Remove a product from the catalog entirely. */
export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
  redirect('/admin/products')
}

/**
 * Stocking a product — pass a positive delta to restock, a negative delta
 * to remove stock (sale, damage, correction). Stock is clamped at 0.
 */
export async function adjustStock(id: string, delta: number) {
  const supabase = await createClient()

  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', id)
    .single()

  if (fetchError || !product) return { error: 'Product not found.' }

  const nextStock = Math.max(0, product.stock + delta)

  const { error } = await supabase
    .from('products')
    .update({ stock: nextStock, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}`)
  return { error: null, stock: nextStock }
}