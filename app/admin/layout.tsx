'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const cookies = document.cookie.split(';');
    let userRole = null;
    cookies.forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key === 'user_role') userRole = value;
    });

    if (userRole !== 'ADMIN') {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center text-cyan-600 font-bold tracking-widest">
        INITIALIZING SECURE PORTAL...
      </div>
    );
  }

  const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Bookings', href: '/admin/bookings' },
    { name: 'Traffic Fines', href: '/admin/fines' },
    { name: 'Assignments', href: '/admin/assignments' },
    { name: 'Calculator', href: '/admin/calculator' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-50 text-slate-900 p-4 sm:p-6 md:p-10 font-sans selection:bg-cyan-400 selection:text-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-sky-200/80 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Al-Suhail Limousine</h1>
            </div>
            <p className="text-cyan-700 font-extrabold text-xs sm:text-sm mt-1 tracking-wider uppercase">Executive Dispatch</p>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="bg-sky-500/10 text-sky-800 px-4 py-1.5 rounded-xl border border-sky-300 text-xs font-black tracking-wider uppercase shadow-sm">
              ADMINISTRATOR
            </div>
            <button onClick={handleLogout} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border border-rose-300 px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-sm">
              Sign Out
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none bg-white/70 backdrop-blur-xl p-2 rounded-2xl border border-sky-200 shadow-xl shadow-sky-900/5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-sky-100/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}