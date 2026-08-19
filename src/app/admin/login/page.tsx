import LoginForm from '@/components/admin/login-form'

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — hidden on small screens */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#e9d0a8] p-12 lg:flex">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#d9483a]/10 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[#d9483a]/10 blur-3xl" />

        <div className="relative z-10">
          <span className="text-3xl font-black tracking-tight text-[#d9483a]">Berry Co.</span>
        </div>

        <div className="relative z-10 max-w-sm space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-700/70">Admin Console</p>
          <p className="text-2xl font-medium leading-snug text-stone-800">
            Manage products, inventory, and orders from one place.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[#faf3e7] p-6 sm:p-10">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl shadow-stone-200/60">
          <div className="mb-1 lg:hidden">
            <span className="text-2xl font-black tracking-tight text-[#d9483a]">Berry Co.</span>
          </div>

          <h1 className="text-xl font-semibold text-stone-900">Sign in to Admin</h1>
          <p className="mb-6 text-sm text-stone-500">
            Use your administrator credentials to continue.
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}