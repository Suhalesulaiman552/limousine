'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie.split(';');
    let userRole = null;

    cookies.forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key === 'user_role') userRole = value;
    });

    if (userRole === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (userRole === 'DRIVER') {
      router.push('/driver/dashboard'); // Or driver view
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading Al-Suhail Portal...
      </div>
    );
  }

  // PUBLIC LANDING PAGE
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