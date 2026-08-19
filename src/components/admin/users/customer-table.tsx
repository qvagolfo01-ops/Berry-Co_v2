import Link from 'next/link'
import type { UserProfile } from '@/lib/data/users'

export default function CustomerTable({
  users,
  page,
  pageSize,
  totalCount,
}: {
  users: UserProfile[]
  page: number
  pageSize: number
  totalCount: number
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stone-400">
                  No customers found.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{user.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-stone-600">{user.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      user.status === 'active'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {user.status === 'active' ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 border-t border-stone-200 p-3">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?tab=customers&page=${p}`}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                p === page ? 'bg-[#d9483a] text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}