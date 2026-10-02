'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [bookingsCount, setBookingsCount] = useState(0);
  const [finesTotal, setFinesTotal] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then(res => res.json()).catch(() => []),
      fetch('/api/fines').then(res => res.json()).catch(() => []),
      fetch('/api/assignments').then(res => res.json()).catch(() => []),
    ]).then(([bookingsData, finesData, assignmentsData]) => {
      if (Array.isArray(bookingsData)) setBookingsCount(bookingsData.length);
      if (Array.isArray(finesData)) {
        const sum = finesData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setFinesTotal(sum);
      }
      if (Array.isArray(assignmentsData)) setAssignmentsCount(assignmentsData.length);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Luminous Master Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0284c7]/80 via-sky-600/70 to-blue-900/80 backdrop-blur-2xl text-white p-6 sm:p-8 rounded-3xl shadow-[0_12px_40px_rgba(2,132,199,0.3)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-cyan-400/40">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-300/30 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="relative z-10">
          <span className="bg-slate-950/40 border border-cyan-400/40 text-cyan-300 text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-sm backdrop-blur-md">
            Command Center Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white">Fleet Operations Hub</h2>
          <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-md font-medium leading-relaxed">
            Synchronized telemetry, live bookings, compliance tracking, and automated fare engines.
          </p>
        </div>
        <Link href="/admin/bookings" className="relative z-10 w-full sm:w-auto text-center bg-white hover:bg-sky-50 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105">
          + New Booking
        </Link>
      </div>

      {/* Stats Cards Grid (Holographic Transparent Glass) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-cyan-400/25 p-5 sm:p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:border-cyan-400/60 transition">
          <h3 className="text-cyan-300/80 text-[10px] sm:text-xs font-black uppercase tracking-wider">Total Bookings</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-white">
            {loading ? '...' : bookingsCount}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
            <span className="text-[10px] sm:text-xs text-cyan-300 font-bold">Neon Synced</span>
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-rose-400/25 p-5 sm:p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:border-rose-400/60 transition">
          <h3 className="text-rose-300/80 text-[10px] sm:text-xs font-black uppercase tracking-wider">Traffic Fines Total</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-rose-400">
            {loading ? '...' : `AED ${finesTotal.toFixed(0)}`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse" />
            <span className="text-[10px] sm:text-xs text-rose-300 font-bold">Violation Alerts</span>
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-cyan-400/25 p-5 sm:p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:border-cyan-400/60 transition">
          <h3 className="text-cyan-300/80 text-[10px] sm:text-xs font-black uppercase tracking-wider">Shift Assignments</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-cyan-300">
            {loading ? '...' : assignmentsCount}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
            <span className="text-[10px] sm:text-xs text-[#dce5d3] font-bold">Active Drivers</span>
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-emerald-400/25 p-5 sm:p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:border-emerald-400/60 transition">
          <h3 className="text-emerald-300/80 text-[10px] sm:text-xs font-black uppercase tracking-wider">Database Status</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-emerald-400">Online</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            <span className="text-[10px] sm:text-xs text-emerald-300 font-bold">PostgreSQL Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Hub (Holographic Glass Modules) */}
      <div>
        <h3 className="text-lg font-black text-[#dce5d3] mb-4 tracking-wider uppercase text-xs">Management Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link href="/admin/bookings" className="group bg-white/[0.04] backdrop-blur-2xl hover:bg-white/[0.08] p-6 rounded-3xl border border-cyan-400/20 hover:border-cyan-400/60 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/30">Dispatch</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-cyan-300 transition">Client Bookings</h4>
              <p className="text-[#dce5d3]/80 text-xs sm:text-sm mt-1">Manage scheduled client rides and dispatch.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all duration-300 shadow-md group-hover:shadow-[0_0_20px_rgba(34,211,238,0.8)]">
              ➔
            </div>
          </Link>

          <Link href="/admin/fines" className="group bg-white/[0.04] backdrop-blur-2xl hover:bg-white/[0.08] p-6 rounded-3xl border border-rose-400/20 hover:border-rose-400/60 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-rose-300 font-black uppercase tracking-wider bg-rose-500/10 px-3 py-1 rounded-full border border-rose-400/30">Compliance</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-rose-400 transition">Traffic Fines</h4>
              <p className="text-[#dce5d3]/80 text-xs sm:text-sm mt-1">Track vehicle penalties and violation expenses.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950/60 border border-rose-400/30 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-md group-hover:shadow-[0_0_20px_rgba(244,63,94,0.8)]">
              ➔
            </div>
          </Link>

          <Link href="/admin/assignments" className="group bg-white/[0.04] backdrop-blur-2xl hover:bg-white/[0.08] p-6 rounded-3xl border border-cyan-400/20 hover:border-cyan-400/60 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/30">Operations</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-cyan-300 transition">Vehicle Shift Lookup</h4>
              <p className="text-[#dce5d3]/80 text-xs sm:text-sm mt-1">Find out which driver was driving any car on any date.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all duration-300 shadow-md group-hover:shadow-[0_0_20px_rgba(34,211,238,0.8)]">
              ➔
            </div>
          </Link>

          <Link href="/admin/calculator" className="group bg-white/[0.04] backdrop-blur-2xl hover:bg-white/[0.08] p-6 rounded-3xl border border-cyan-400/20 hover:border-cyan-400/60 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/30">Finance</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-cyan-300 transition">Trip Fare Calculator</h4>
              <p className="text-[#dce5d3]/80 text-xs sm:text-sm mt-1">Estimate fuel and fares using Special 95 rates.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all duration-300 shadow-md group-hover:shadow-[0_0_20px_rgba(34,211,238,0.8)]">
              ➔
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}