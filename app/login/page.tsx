'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Force a hard navigation to bypass any client-side router caching issues
        window.location.href = '/admin/monthly';
      } else {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
      }
    } catch {
      setError('Network error during login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-sky-500/20 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-8">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_12px_rgba(34,211,238,0.8)] mb-2" />
          <h2 className="text-xl font-light text-white tracking-tight">Fleet Portal Login</h2>
          <p className="text-sky-200/60 text-xs mt-1">Sign in with your username (e.g. suhail or mariyam).</p>
        </div>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/30 text-rose-200 p-3 rounded-xl text-xs mb-6 text-center backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-medium text-sky-200/80 uppercase tracking-wide mb-1.5">Username</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. suhail"
              className="w-full bg-white/5 border border-sky-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-sky-200/80 uppercase tracking-wide mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-sky-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-xs py-3 rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}