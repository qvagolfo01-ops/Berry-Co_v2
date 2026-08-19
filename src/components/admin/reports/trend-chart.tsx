import type { TrendPoint } from '@/lib/data/reports'

export default function TrendChart({
  data,
  formatValue = (value: number) => value.toLocaleString(),
  barClassName = 'bg-[#d9483a]/70 hover:bg-[#d9483a]',
}: {
  data: TrendPoint[]
  formatValue?: (value: number) => string
  barClassName?: string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((point) => (
        <div key={point.date} className="flex flex-1 flex-col items-center justify-end gap-1">
          <div
            className={`w-full rounded-t transition-colors ${barClassName}`}
            style={{
              height: `${(point.value / max) * 100}%`,
              minHeight: point.value > 0 ? '4px' : '1px',
            }}
            title={formatValue(point.value)}
          />
          <span className="text-[10px] text-stone-400">{new Date(point.date).getDate()}</span>
        </div>
      ))}
    </div>
  )
}