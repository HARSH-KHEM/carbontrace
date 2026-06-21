'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full grid place-items-center p-4 relative overflow-hidden bg-[#0a1f0f]">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 blur-[120px] rounded-full -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="w-[100%] max-w-[400px] z-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <h1 className="font-headline-md text-3xl font-bold tracking-tight text-on-surface">CarbonTrace</h1>
          </div>
          <p className="text-on-surface-variant font-body-md">Welcome back to your sustainability journey.</p>
        </div>

        <div className="w-full bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="font-headline-md text-2xl mb-6 text-white font-bold text-center">Sign In</h2>
          
          {error && (
            <div className="bg-error/20 text-error p-3 rounded-lg mb-4 text-sm font-body-md border border-error/30">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-label-md text-on-surface-variant mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 rounded-lg bg-white/5 text-white border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none px-4 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block font-label-md text-on-surface-variant mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 rounded-lg bg-white/5 text-white border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none px-4 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-surface h-12 rounded-full font-bold mt-2 glow-primary hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center font-body-md text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:text-primary-fixed transition-colors font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
