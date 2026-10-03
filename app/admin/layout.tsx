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
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-50 flex items-center justify-center text-cyan-600 font-light tracking-[0.2em] text-xs">
        LOADING SECURE PORTAL...
      </div>
    );
  }

  // Assignments removed; clean active navigation links only
  const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Bookings', href: '/admin/bookings' },
    { name: 'Traffic Fines', href: '/admin/fines' },
    { name: 'Calculator', href: '/admin/calculator' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100/70 via-white to-sky-50 text-slate-800 p-4 sm:p-6 md:p-10 font-sans selection:bg-cyan-300 selection:text-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* Minimalist Header Panel */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-sky-200/50 gap-4 bg-white/40 backdrop-blur-xl px-6 py-5 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)] border border-white/60">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              <h1 className="text-lg sm:text-xl font-normal tracking-tight text-slate-900">Al-Suhail Limousine</h1>
            </div>
            <p className="text-cyan-600 font-medium text-[11px] mt-0.5 tracking-[0.15em] uppercase opacity-90">Executive Dispatch</p>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="bg-cyan-500/10 text-cyan-800 px-3 py-1 rounded-xl border border-cyan-200 text-[11px] font-medium tracking-[0.1em] uppercase backdrop-blur-md">
              Admin
            </div>
            <button onClick={handleLogout} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl text-[11px] font-medium transition backdrop-blur-md">
              Sign Out
            </button>
          </div>
        </header>

        {/* Minimalist Navigation Bar */}
        <nav className="flex gap-1.5 mb-10 overflow-x-auto pb-2 scrollbar-none bg-white/40 backdrop-blur-xl p-1.5 rounded-2xl border border-sky-200/60 shadow-[0_4px_24px_0_rgba(2,132,199,0.04)]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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