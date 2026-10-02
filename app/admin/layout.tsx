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
      <div className="min-h-screen bg-sky-950 flex items-center justify-center text-sky-200 font-medium">
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
    <div className="min-h-screen bg-sky-900 text-black p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-sky-700/60 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">Al-Suhail Limousine</h1>
            <p className="text-sky-200 font-semibold text-xs sm:text-sm">Admin Control Center</p>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="bg-black text-sky-300 px-3 py-1.5 rounded-lg border border-sky-700 text-xs font-bold tracking-wider">
              ADMINISTRATOR
            </div>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white border border-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
              Sign Out
            </button>
          </div>
        </header>

        {/* Navigation Tabs (Scrollable on Mobile) */}
        <nav className="flex gap-2 mb-6 overflow-x-auto pb-2 bg-sky-800/80 backdrop-blur p-2 rounded-2xl border border-sky-700 shadow-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-black text-white shadow-md'
                    : 'text-sky-100 hover:text-white hover:bg-sky-700/60'
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