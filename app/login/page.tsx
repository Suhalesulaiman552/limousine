'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data));
        
        // Route based on role
        if (data.role === 'manager') {
          router.push('/manager');
        } else {
          router.push('/driver');
        }
      } else {
        alert(data.error || 'Invalid credentials');
      }
    } catch (err) {
      alert('Login connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 p-6 flex flex-col justify-center items-center selection:bg-sky-500 selection:text-white">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm text-center space-y-2">
          <div className="inline-block p-3 rounded-2xl bg-sky-50 text-sky-600 mb-2">
            <span className="text-2xl font-bold">🚗</span>
          </div>
          <p className="text-[11px] uppercase tracking-widest text-sky-600 font-extrabold">Al-Suhail Fleet Management</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">System Portal</h1>
          <p className="text-xs text-slate-400">Sign in as a Manager or Driver</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm space-y-4">
          
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" 
              placeholder="e.g. suhail, asma, shahiba, mariyam" 
              required 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold p-4 rounded-2xl text-sm shadow-lg shadow-sky-600/25 transition-all mt-2">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        <div className="text-center text-xs text-slate-400 font-medium">
          Al-Suhail Fleet Management System v2.0
        </div>

      </div>
    </div>
  );
}