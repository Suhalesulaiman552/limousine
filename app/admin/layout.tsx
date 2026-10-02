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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
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
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-slate-800 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-amber-400">Al-Suhail Limousine</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Admin Portal</p>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-amber-400 font-semibold">ADMIN</span>
            </div>
            <button onClick={handleLogout} className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
              Sign Out
            </button>
          </div>
        </header>

        {/* Navigation Tabs (Scrollable on Mobile) */}
        <nav className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none bg-slate-900 p-2 rounded-2xl border border-slate-800">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
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