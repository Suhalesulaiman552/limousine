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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-sky-400 font-medium tracking-wide">
        Verifying Administrator Access...
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10 font-sans selection:bg-sky-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Al-Suhail Limousine</h1>
            </div>
            <p className="text-sky-400 font-medium text-xs sm:text-sm mt-0.5 tracking-wide">Executive Fleet Management</p>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="bg-sky-500/10 text-sky-300 px-3.5 py-1.5 rounded-xl border border-sky-500/20 text-xs font-bold tracking-wider uppercase">
              Admin Portal
            </div>
            <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm">
              Sign Out
            </button>
          </div>
        </header>

        {/* Navigation Tabs (Scrollable on Mobile) */}
        <nav className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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