'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [bookingsCount, setBookingsCount] = useState(0);
  const [finesTotal, setFinesTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then(res => res.json()).catch(() => []),
      fetch('/api/fines').then(res => res.json()).catch(() => []),
    ]).then(([bookingsData, finesData]) => {
      if (Array.isArray(bookingsData)) setBookingsCount(bookingsData.length);
      if (Array.isArray(finesData)) {
        const sum = finesData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setFinesTotal(sum);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Minimalist Luminous Master Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 text-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.25)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-cyan-300/40">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[70px] pointer-events-none" />
        
        <div className="relative z-10">
          <span className="bg-white/20 border border-white/30 text-white text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-[0.15em] backdrop-blur-md">
            Active Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-light mt-3 tracking-tight text-white">Fleet Operations</h2>
          <p className="text-sky-100 text-xs mt-1 max-w-sm font-light leading-relaxed opacity-90">
            Real-time telemetry, client bookings, compliance tracking, and automated fare estimators.
          </p>
        </div>
        <Link href="/admin/bookings" className="relative z-10 w-full sm:w-auto text-center bg-white hover:bg-sky-50 text-slate-900 text-xs font-medium px-5 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.02]">
          + New Booking
        </Link>
      </div>

      {/* Stats Cards Grid (Assignments card removed, now 3 clean cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)] hover:border-cyan-400 transition-all duration-300">
          <h3 className="text-slate-500 text-[11px] font-medium tracking-[0.1em] uppercase">Total Bookings</h3>
          <p className="text-2xl sm:text-3xl font-light mt-2 text-slate-900">
            {loading ? '...' : bookingsCount}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span className="text-[10px] text-cyan-700 font-medium tracking-wide">Synced</span>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)] hover:border-rose-400 transition-all duration-300">
          <h3 className="text-slate-500 text-[11px] font-medium tracking-[0.1em] uppercase">Traffic Fines</h3>
          <p className="text-2xl sm:text-3xl font-light mt-2 text-rose-600">
            {loading ? '...' : `AED ${finesTotal.toFixed(0)}`}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] text-rose-600 font-medium tracking-wide">Alerts</span>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)] hover:border-emerald-400 transition-all duration-300">
          <h3 className="text-slate-500 text-[11px] font-medium tracking-[0.1em] uppercase">Database</h3>
          <p className="text-2xl sm:text-3xl font-light mt-2 text-emerald-600">Online</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-emerald-700 font-medium tracking-wide">Neon DB</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Hub (Assignments shortcut removed) */}
      <div>
        <h3 className="text-xs font-medium text-slate-500 mb-3 tracking-[0.15em] uppercase">Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/bookings" className="group bg-white/50 backdrop-blur-xl hover:bg-white/80 p-5 rounded-2xl border border-sky-200/80 hover:border-cyan-400 transition-all duration-300 shadow-[0_4px_20px_0_rgba(2,132,199,0.05)] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-cyan-700 font-medium tracking-[0.1em] uppercase bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-200">Dispatch</span>
              <h4 className="text-base font-normal text-slate-900 mt-2 group-hover:text-cyan-600 transition">Client Bookings</h4>
              <p className="text-slate-500 text-xs font-light mt-0.5">Manage scheduled rides and reservations.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-sm text-sm">
              ➔
            </div>
          </Link>

          <Link href="/admin/fines" className="group bg-white/50 backdrop-blur-xl hover:bg-white/80 p-5 rounded-2xl border border-sky-200/80 hover:border-rose-400 transition-all duration-300 shadow-[0_4px_20px_0_rgba(2,132,199,0.05)] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-rose-600 font-medium tracking-[0.1em] uppercase bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-200">Compliance</span>
              <h4 className="text-base font-normal text-slate-900 mt-2 group-hover:text-rose-600 transition">Traffic Fines</h4>
              <p className="text-slate-500 text-xs font-light mt-0.5">Track vehicle penalties and violation expenses.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-sm text-sm">
              ➔
            </div>
          </Link>

          <Link href="/admin/calculator" className="group bg-white/50 backdrop-blur-xl hover:bg-white/80 p-5 rounded-2xl border border-sky-200/80 hover:border-cyan-400 transition-all duration-300 shadow-[0_4px_20px_0_rgba(2,132,199,0.05)] flex justify-between items-center sm:col-span-2">
            <div>
              <span className="text-[10px] text-cyan-700 font-medium tracking-[0.1em] uppercase bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-200">Finance</span>
              <h4 className="text-base font-normal text-slate-900 mt-2 group-hover:text-cyan-600 transition">Trip Fare Calculator</h4>
              <p className="text-slate-500 text-xs font-light mt-0.5">Estimate fuel and fares using Special 95 rates.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-sm text-sm">
              ➔
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}