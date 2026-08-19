import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getAdminAccounts, getCustomers } from '@/lib/data/users'
import CustomerTable from '@/components/admin/users/customer-table'
import AdminTable from '@/components/admin/users/admin-table'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; search?: string; page?: string }>
}) {
  const { tab, search, page } = await searchParams
  const activeTab = tab === 'admins' ? 'admins' : 'customers'
  const pageNum = Number(page ?? '1') || 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Users</h1>
          <p className="text-sm text-stone-500">Manage customer and admin accounts.</p>
        </div>
        {activeTab === 'admins' && (
          <Link
            href="/admin/users/new"
            className="flex items-center gap-1.5 rounded-full bg-[#d9483a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c23f32]"
          >
            <Plus size={16} /> Add Admin
          </Link>
        )}
      </div>

      <div className="flex w-fit gap-1 rounded-full border border-stone-200 bg-white p-1">
        <Link
          href="/admin/users?tab=customers"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'customers'
              ? 'bg-[#f6e3c9] text-[#a83324]'
              : 'text-stone-500 hover:bg-stone-100'
          }`}
        >
          Customers
        </Link>
        <Link
          href="/admin/users?tab=admins"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'admins'
              ? 'bg-[#f6e3c9] text-[#a83324]'
              : 'text-stone-500 hover:bg-stone-100'
          }`}
        >
          Admin Team
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <input type="hidden" name="tab" value={activeTab} />
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search by name or email…"
          className="w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm sm:w-64"
        />
        <button
          type="submit"
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
        >
          Search
        </button>
      </form>

      {activeTab === 'customers' ? (
        <CustomersSection search={search} page={pageNum} />
      ) : (
        <AdminsSection search={search} />
      )}
    </div>
  )
}

async function CustomersSection({ search, page }: { search?: string; page: number }) {
  const { users, count } = await getCustomers({ search, page, pageSize: 20 })
  return <CustomerTable users={users} page={page} pageSize={20} totalCount={count} />
}

async function AdminsSection({ search }: { search?: string }) {
  const admins = await getAdminAccounts({ search })
  return <AdminTable admins={admins} />
}