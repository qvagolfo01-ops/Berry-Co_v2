import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/data/data-products'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const search = url.searchParams.get('search') ?? undefined
  const categoryId = url.searchParams.get('category') ?? undefined
  const status = url.searchParams.get('status') ?? undefined
  const page = Number(url.searchParams.get('page') ?? '1') || 1
  const pageSize = Number(url.searchParams.get('pageSize') ?? '20') || 20

  const result = await getProducts({ search, categoryId, status: status as any, page, pageSize })
  return NextResponse.json(result)
}
