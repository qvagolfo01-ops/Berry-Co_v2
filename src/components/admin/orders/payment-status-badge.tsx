import type { PaymentStatus } from '@/types/database'

const styles: Record<PaymentStatus, string> = {
  pending: 'bg-stone-100 text-stone-600 border-stone-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  refunded: 'bg-[#fbe3df] text-[#c23f32] border-[#f3c4bc]',
}

const labels: Record<PaymentStatus, string> = {
  pending: 'Payment Pending',
  paid: 'Paid',
  refunded: 'Refunded',
}

export default function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}