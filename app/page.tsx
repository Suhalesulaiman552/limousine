'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie.split(';');
    let userRole = null;
    let userName = null;

    cookies.forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key === 'user_role') userRole = value;
      if (key === 'user_name') userName = decodeURIComponent(value);
    });

    setRole(userRole);
    setName(userName);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setRole(null);
    setName(null);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading Al-Suhail Portal...
      </div>
    );
  }

  // PUBLIC LANDING PAGE (Secure - No company data shown)
  if (!role) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 p-10 rounded-3xl text-center shadow-2xl">
          <div className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Secure Fleet Portal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Al-Suhail Limousine</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Private transport & limousine operations management in Dibba & Berlin. Authorized personnel and registered drivers only.
          </p>
          <div className="space-y-3">
            <Link href="/login" className="block w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-3 rounded-xl transition shadow-lg shadow-amber-500/10">
              Sign In to Portal
            </Link>
            <Link href="/register" className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition border border-slate-700">
              Driver Self-Registration
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // DRIVER VIEW
  if (role === 'DRIVER') {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-amber-400">Driver Portal</h1>
              <p className="text-slate-400 text-sm">Welcome back, {name || 'Driver'}</p>
            </div>
            <button onClick={handleLogout} className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-4 py-2 rounded-lg text-xs font-semibold transition">
              Sign Out
            </button>
          </header>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl mb-6">
            <h2 className="text-lg font-semibold text-amber-300 mb-2">Assigned Duty Status</h2>
            <p className="text-slate-300 text-sm">You are connected to the Al-Suhail dispatch network.</p>
            <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-medium">Status</span>
                <span className="text-emerald-400 font-semibold text-sm">● Ready for Dispatch</span>
              </div>
              <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold px-4 py-2 rounded-lg transition">
                Toggle Status
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ADMIN VIEW (Full Fleet Management)
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-amber-400">Al-Suhail Limousine Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Fleet Operations & Management Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 text-xs">
              Access: <span className="text-amber-400 font-semibold">ADMINISTRATOR</span>
            </div>
            <button onClick={handleLogout} className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-4 py-2 rounded-lg text-xs font-semibold transition">
              Sign Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-slate-400 text-xs font-semibold uppercase">Active Fleet</h3>
            <p className="text-3xl font-bold mt-2 text-white">4 Vehicles</p>
            <span className="text-xs text-amber-400 mt-2 block">Corolla, Camry, Kia, Patrol</span>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-slate-400 text-xs font-semibold uppercase">Today's Bookings</h3>
            <p className="text-3xl font-bold mt-2 text-white">12</p>
            <span className="text-xs text-emerald-400 mt-2 block">+3 scheduled for evening</span>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-slate-400 text-xs font-semibold uppercase">Fuel Cost Tracker</h3>
            <p className="text-3xl font-bold mt-2 text-white">AED 450</p>
            <span className="text-xs text-slate-400 mt-2 block">Special 95 Rate Applied</span>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-slate-400 text-xs font-semibold uppercase">Database Status</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-400">Connected</p>
            <span className="text-xs text-slate-400 mt-2 block">Neon PostgreSQL</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-amber-300">Quick Fleet Control</h2>
          <p className="text-slate-300 text-sm mb-6">
            Manage your daily client calls, calculate route distances, and review trip fares instantly.
          </p>
          <div className="flex gap-4">
            <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-5 py-2.5 rounded-lg transition text-sm">
              + New Booking
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-lg transition border border-slate-700 text-sm">
              Calculate Trip Fare
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}