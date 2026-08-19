'use client'

import { Printer } from 'lucide-react'

export default function PrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-1.5 rounded-full bg-[#d9483a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c23f32] print:hidden"
    >
      <Printer size={15} /> {label}
    </button>
  )
}