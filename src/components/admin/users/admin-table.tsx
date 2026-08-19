'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteAdminAccount } from '@/lib/actions/users'
import type { UserProfile } from '@/lib/data/users'

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  staff: 'Staff',
}

const roleStyles: Record<string, string> = {
  super_admin: 'bg-[#fbe3df] text-[#c23f32] border-[#f3c4bc]',
  admin: 'bg-[#f6e3c9] text-[#a97a2e] border-[#ecd3a8]',
  staff: 'bg-stone-100 text-stone-600 border-stone-200',
}

export default function AdminTable({ admins }: { admins: UserProfile[] }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string, name: string) {
    if (!confirm(`Remove admin access for "${name}"? This deletes their login entirely.`)) return
    startTransition(() => {
      deleteAdminAccount(id)
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {admins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stone-400">
                  No admin accounts found.
                </td>
              </tr>
            )}
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{admin.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-stone-600">{admin.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      roleStyles[admin.role]
                    }`}
                  >
                    {roleLabels[admin.role] ?? admin.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      admin.status === 'active'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {admin.status === 'active' ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/users/${admin.id}`}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        handleDelete(admin.id, admin.full_name ?? admin.email ?? 'this account')
                      }
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}