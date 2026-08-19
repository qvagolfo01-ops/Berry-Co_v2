'use client'

import { useRef, useState } from 'react'

type Tone = 'rose' | 'amber' | 'emerald' | 'stone'

// Static class map — Tailwind can't see dynamically-built class strings, so
// each tone's classes must exist literally somewhere.
const toneClasses: Record<Tone, { box: string; label: string }> = {
  rose: { box: 'bg-[#fbe3df] border-[#f3c4bc]', label: 'text-[#c23f32]' },
  amber: { box: 'bg-[#f6e3c9] border-[#ecd3a8]', label: 'text-[#a97a2e]' },
  emerald: { box: 'bg-emerald-50 border-emerald-200', label: 'text-emerald-700' },
  stone: { box: 'bg-stone-100 border-stone-200', label: 'text-stone-600' },
}

export interface UpdatesCarouselProps {
  lowStock: { name: string; stock: number }[]
  pendingOrders: number
  revenueLast30Days: number
  newCustomersThisWeek: number
}

export default function UpdatesCarousel({
  lowStock,
  pendingOrders,
  revenueLast30Days,
  newCustomersThisWeek,
}: UpdatesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const slides: { title: string; tone: Tone; body: React.ReactNode }[] = [
    {
      title: 'Inventory Report',
      tone: 'amber',
      body:
        lowStock.length === 0 ? (
          <p className="text-sm text-stone-500">All products are comfortably stocked.</p>
        ) : (
          <ul className="space-y-0.5 text-sm text-stone-600">
            {lowStock.map((p) => (
              <li key={p.name}>
                {p.name} — {p.stock} left
              </li>
            ))}
          </ul>
        ),
    },
    {
      title: 'Sales Summary',
      tone: 'rose',
      body: (
        <p className="text-sm text-stone-600">
          ₱{revenueLast30Days.toLocaleString()} in revenue over the last 30 days.
        </p>
      ),
    },
    {
      title: 'New Orders',
      tone: 'emerald',
      body: (
        <p className="text-sm text-stone-600">
          {pendingOrders} order{pendingOrders === 1 ? '' : 's'} awaiting fulfillment.
        </p>
      ),
    },
    {
      title: 'User Activity',
      tone: 'stone',
      body: (
        <p className="text-sm text-stone-600">
          {newCustomersThisWeek} new customer{newCustomersThisWeek === 1 ? '' : 's'} this week.
        </p>
      ),
    },
  ]

  function goTo(index: number) {
    const track = trackRef.current
    if (!track) return
    const slide = track.children[index] as HTMLElement | undefined
    slide?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    setActive(index)
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="p-5 pb-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900">
            Reports &amp; Management Updates
          </h2>
          <div className="flex gap-1">
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
              onClick={() => goTo(Math.max(active - 1, 0))}
              aria-label="Previous update"
            >
              ‹
            </button>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
              onClick={() => goTo(Math.min(active + 1, slides.length - 1))}
              aria-label="Next update"
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide) => (
            <div key={slide.title} className="w-full flex-none snap-start sm:w-1/2 lg:w-1/3">
              <div className={`h-full rounded-xl border p-5 ${toneClasses[slide.tone].box}`}>
                <p
                  className={`mb-2 text-xs font-medium uppercase tracking-wide ${toneClasses[slide.tone].label}`}
                >
                  Live
                </p>
                <h3 className="mb-1 font-semibold text-stone-900">{slide.title}</h3>
                {slide.body}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Go to ${slide.title}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? 'w-5 bg-[#d9483a]' : 'w-1.5 bg-stone-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}