import type { LucideIcon } from 'lucide-react'

type Tone = 'rose' | 'amber' | 'emerald' | 'stone'

const toneClasses: Record<Tone, { box: string; icon: string }> = {
  rose: { box: 'bg-[#fbe3df] border-[#f3c4bc]', icon: 'text-[#c23f32]' },
  amber: { box: 'bg-[#f6e3c9] border-[#ecd3a8]', icon: 'text-[#a97a2e]' },
  emerald: { box: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-700' },
  stone: { box: 'bg-stone-100 border-stone-200', icon: 'text-stone-600' },
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'rose',
  hint,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: Tone
  hint?: string
}) {
  const classes = toneClasses[tone]

  return (
    <div className={`rounded-2xl border p-4 ${classes.box}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
        <Icon size={16} className={classes.icon} />
      </div>
      <p className="mt-1 text-2xl font-semibold text-stone-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  )
}