import type { BreakdownItem } from '@/lib/data/reports'

export default function BreakdownList({
  items,
  barClassName = 'bg-[#d9483a]',
}: {
  items: BreakdownItem[]
  barClassName?: string
}) {
  if (items.length === 0) {
    return <p className="text-sm text-stone-400">No data yet.</p>
  }

  const max = Math.max(1, ...items.map((i) => i.value))

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-stone-700">{item.label}</span>
            <span className="text-stone-500">{item.displayValue}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-stone-100">
            <div
              className={`h-2 rounded-full ${barClassName}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}