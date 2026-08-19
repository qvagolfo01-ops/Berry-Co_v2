import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect('/login');

	const { data: profile } = await supabase
		.from('profiles')
		.select('full_name, phone, role, status, created_at')
		.eq('id', user.id)
		.maybeSingle();

	const displayName = profile?.full_name || user.user_metadata?.full_name || 'Berry Co. collector';
	const memberSince = new Intl.DateTimeFormat('en', {
		month: 'long',
		year: 'numeric',
	}).format(new Date(profile?.created_at ?? user.created_at));

	return (
		<main className="page-shell">
			<div className="page-container">
				<header className="flex items-center justify-between border-b border-dark/10 pb-5">
					<Link href="/" className="text-2xl font-black tracking-tight text-brand">
						Berry Co.
					</Link>
					<nav className="flex items-center gap-4 text-sm font-bold text-dark">
						<Link href="/products" className="transition hover:text-brand">Products</Link>
						<Link href="/cart" className="transition hover:text-brand">Cart</Link>
					</nav>
				</header>

				<section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
					<div className="content-panel flex min-h-0 flex-col justify-between gap-8">
						<div>
							<p className="text-xs font-black uppercase tracking-[0.2em] text-brand">Your account</p>
							<h1 className="mt-3 text-4xl font-black tracking-tight text-dark md:text-5xl">Welcome, {displayName}.</h1>
							<p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-dark/70">
								Your Berry Co. account is ready. Keep your details close and get back to collecting.
							</p>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<Link href="/products" className="rounded-2xl bg-brand px-5 py-4 text-center text-sm font-black text-white transition hover:bg-brand-dark">
								Browse products
							</Link>
							<Link href="/cart" className="rounded-2xl border border-dark/20 bg-paper px-5 py-4 text-center text-sm font-black text-dark transition hover:border-brand hover:text-brand">
								View cart
							</Link>
						</div>
					</div>

					<div className="sidebar-panel min-h-0 gap-5">
						<div className="flex items-center gap-4">
							<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-2xl font-black text-white">
								{displayName.charAt(0).toUpperCase()}
							</div>
							<div className="min-w-0">
								<h2 className="truncate text-xl font-black text-dark">{displayName}</h2>
								<p className="truncate text-sm font-semibold text-dark/60">{user.email}</p>
							</div>
						</div>

						<div className="space-y-3 border-t border-dark/10 pt-5 text-sm">
							<div className="flex justify-between gap-4"><span className="font-semibold text-dark/60">Phone</span><span className="font-bold text-dark">{profile?.phone || 'Not added'}</span></div>
							<div className="flex justify-between gap-4"><span className="font-semibold text-dark/60">Member since</span><span className="font-bold text-dark">{memberSince}</span></div>
							<div className="flex justify-between gap-4"><span className="font-semibold text-dark/60">Account status</span><span className="font-bold capitalize text-brand">{profile?.status || 'active'}</span></div>
						</div>

						<form action={async () => {
							'use server';
							const serverSupabase = await createClient();
							await serverSupabase.auth.signOut();
							redirect('/login');
						}}>
							<button type="submit" className="w-full rounded-full border border-dark/20 px-4 py-3 text-sm font-black text-dark transition hover:border-brand hover:text-brand">
								Sign out
							</button>
						</form>
					</div>
				</section>
			</div>
		</main>
	);
}
