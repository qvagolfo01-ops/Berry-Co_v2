import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentAdmin } from '@/lib/actions/auth'
import { getOrderById } from '@/lib/data/orders'
import OrderPrintDocument from '@/components/admin/orders/order-print-document'
import PrintButton from '@/components/admin/orders/print-button'

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const { id } = await params
  const result = await getOrderById(id)
  if (!result) notFound()

  return (
    <div className="min-h-screen bg-stone-100 py-10">
      <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between print:hidden">
        <Link
          href={`/admin/orders/${id}`}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
        >
          <ArrowLeft size={15} /> Back to order
        </Link>
        <PrintButton label="Print Invoice" />
      </div>
      <OrderPrintDocument order={result.order} items={result.items} variant="invoice" />
    </div>
  )
}