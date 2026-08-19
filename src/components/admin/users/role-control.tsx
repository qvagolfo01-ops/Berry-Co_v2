'use client'

import { useState, useTransition } from 'react'
import { updateAdminRole } from '@/lib/actions/users'
import type { UserRole } from '@/types/database'

export default function RoleControl({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: UserRole
}) {
  const [role, setRole] = useState<UserRole>(currentRole)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleChange(newRole: UserRole) {
    setRole(newRole)
    setSaved(false)
    startTransition(async () => {
      const result = await updateAdminRole(userId, newRole)
      if (!result?.error) setSaved(true)
    })
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="mb-1 text-base font-semibold text-stone-900">Role</h2>
      <p className="mb-3 text-sm text-stone-500">Controls what this account can access.</p>
      <div className="flex items-center gap-2">
        <select
          value={role}
          onChange={(e) => handleChange(e.target.value as UserRole)}
          disabled={isPending}
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm focus:border-[#d9483a] focus:outline-none focus:ring-2 focus:ring-[#d9483a]/20"
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        {saved && !isPending && <span className="text-xs text-emerald-600">Saved</span>}
      </div>
    </div>
  )
}