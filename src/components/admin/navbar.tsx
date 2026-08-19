'use client'

import { useEffect, useRef, useState } from 'react'
import { LogOut, Menu } from 'lucide-react'
import { logoutAdmin } from '@/lib/actions/auth'

export default function AdminNavbar({
  name,
  avatarUrl,
  onMenuClick,
}: {
  name: string
  avatarUrl?: string | null
  onMenuClick?: () => void
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-stone-100"
        >
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#d9483a] text-xs font-semibold text-white">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <span className="hidden text-sm font-medium text-stone-700 sm:inline">{name}</span>
        </button>

        {open && (
          <div className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg">
            <button
              type="button"
              onClick={() => logoutAdmin()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100"
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}