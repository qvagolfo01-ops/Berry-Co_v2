'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Register with Supabase and let the backend create the profile row.
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    alert('Account created successfully! Welcome to Deckdrop.');
    router.push('/page');
    router.refresh();
  };

  return (
    <main className="min-h-screen w-full bg-[#EAD0AA] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#FBF4E4] rounded-[2.5rem] p-8 shadow-sm border border-[#35322E]/10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <Link href="/" className="text-3xl font-black text-[#E23B2E] tracking-tight block mb-1">
            Deckdrop
          </Link>
          <h1 className="text-2xl font-black text-[#35322E]">Create an Account</h1>
          <p className="text-xs font-semibold text-[#35322E]/70">
            Sign up to start buying rare TCGs and collectibles
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-[#E23B2E]/10 border border-[#E23B2E] text-[#E23B2E] text-xs p-3 rounded-xl text-center font-bold">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs font-semibold text-[#35322E]">
          <div className="space-y-1">
            <label className="block font-bold">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Dela Cruz"
              className="w-full bg-[#F3E4C8] border border-[#35322E]/30 rounded-xl px-3 py-2.5 text-sm text-[#35322E] focus:outline-none focus:border-[#E23B2E] transition font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collector@berryco.ph"
              className="w-full bg-[#F3E4C8] border border-[#35322E]/30 rounded-xl px-3 py-2.5 text-sm text-[#35322E] focus:outline-none focus:border-[#E23B2E] transition font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#F3E4C8] border border-[#35322E]/30 rounded-xl px-3 py-2.5 text-sm text-[#35322E] focus:outline-none focus:border-[#E23B2E] transition font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#F3E4C8] border border-[#35322E]/30 rounded-xl px-3 py-2.5 text-sm text-[#35322E] focus:outline-none focus:border-[#E23B2E] transition font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E23B2E] hover:bg-[#B82A20] text-[#FFFDF8] font-extrabold py-3 rounded-full text-xs transition-colors mt-2 shadow-sm disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#35322E] font-semibold">
          Already have an account?{' '}
          <Link href="/login" className="text-[#E23B2E] font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}