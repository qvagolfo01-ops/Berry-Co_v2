import type { CategoryNode } from '@/lib/data/data-products'

const defaultClass =
  'w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-800 focus:border-[#d9483a] focus:outline-none focus:ring-2 focus:ring-[#d9483a]/20'

export default function CategorySelect({
  categories,
  name = 'category_id',
  defaultValue,
  includeAllOption,
  className,
}: {
  categories: CategoryNode[]
  name?: string
  defaultValue?: string
  includeAllOption?: boolean
  className?: string
}) {
  return (
    <select name={name} defaultValue={defaultValue ?? ''} className={className ?? defaultClass}>
      {includeAllOption ? (
        <option value="">All categories</option>
      ) : (
        <option value="">Select a category…</option>
      )}
      {categories.map((top) => (
        <optgroup key={top.id} label={top.name}>
          {top.children.flatMap((sub) =>
            sub.children.map((leaf) => (
              <option key={leaf.id} value={leaf.id}>
                {sub.name} — {leaf.name}
              </option>
            ))
          )}
        </optgroup>
      ))}
    </select>
  )
}