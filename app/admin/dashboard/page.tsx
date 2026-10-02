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
      {/* Master Aurora Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-600 text-slate-950 p-6 sm:p-8 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-200/30 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <span className="bg-slate-950/15 border border-slate-950/20 text-slate-950 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            Command Center Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-slate-950">Fleet Operations Hub</h2>
          <p className="text-slate-900 text-xs sm:text-sm mt-1 max-w-md font-semibold leading-relaxed">
            Synchronized telemetry, live bookings, compliance tracking, and automated fare engines.
          </p>
        </div>
        <Link href="/admin/bookings" className="relative z-10 w-full sm:w-auto text-center bg-slate-950 hover:bg-slate-900 text-cyan-400 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:scale-105">
          + New Booking
        </Link>
      </div>

      {/* Stats Cards Grid (Aurora Glass Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-sky-950/40 backdrop-blur-2xl border border-sky-400/20 p-5 sm:p-6 rounded-2xl shadow-xl hover:border-cyan-400/50 transition">
          <h3 className="text-slate-300 text-[10px] sm:text-xs font-black uppercase tracking-wider">Total Bookings</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-white">
            {loading ? '...' : bookingsCount}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-[10px] sm:text-xs text-cyan-300 font-bold">Neon Synced</span>
          </div>
        </div>

        <div className="bg-sky-950/40 backdrop-blur-2xl border border-sky-400/20 p-5 sm:p-6 rounded-2xl shadow-xl hover:border-rose-400/50 transition">
          <h3 className="text-slate-300 text-[10px] sm:text-xs font-black uppercase tracking-wider">Traffic Fines Total</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-rose-400">
            {loading ? '...' : `AED ${finesTotal.toFixed(0)}`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
            <span className="text-[10px] sm:text-xs text-rose-300 font-bold">Violation Alerts</span>
          </div>
        </div>

        <div className="bg-sky-950/40 backdrop-blur-2xl border border-sky-400/20 p-5 sm:p-6 rounded-2xl shadow-xl hover:border-cyan-400/50 transition">
          <h3 className="text-slate-300 text-[10px] sm:text-xs font-black uppercase tracking-wider">Shift Assignments</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-cyan-300">
            {loading ? '...' : assignmentsCount}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-[10px] sm:text-xs text-slate-300 font-bold">Active Drivers</span>
          </div>
        </div>

        <div className="bg-sky-950/40 backdrop-blur-2xl border border-sky-400/20 p-5 sm:p-6 rounded-2xl shadow-xl hover:border-emerald-400/50 transition">
          <h3 className="text-slate-300 text-[10px] sm:text-xs font-black uppercase tracking-wider">Database Status</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-emerald-400">Online</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] sm:text-xs text-emerald-300 font-bold">PostgreSQL Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Hub */}
      <div>
        <h3 className="text-lg font-black text-slate-300 mb-4 tracking-wider uppercase text-xs">Management Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link href="/admin/bookings" className="group bg-sky-950/40 backdrop-blur-2xl hover:bg-sky-900/60 p-6 rounded-3xl border border-sky-400/20 hover:border-cyan-400 transition-all duration-300 shadow-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider bg-cyan-500/15 px-2.5 py-1 rounded-lg border border-cyan-400/30">Dispatch</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-cyan-300 transition">Client Bookings</h4>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">Manage scheduled client rides and dispatch.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-sky-400/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all duration-300 shadow-lg group-hover:shadow-[0_0_20px_rgba(6,182,212,0.8)]">
              ➔
            </div>
          </Link>

          <Link href="/admin/fines" className="group bg-sky-950/40 backdrop-blur-2xl hover:bg-sky-900/60 p-6 rounded-3xl border border-sky-400/20 hover:border-rose-400 transition-all duration-300 shadow-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-rose-300 font-black uppercase tracking-wider bg-rose-500/15 px-2.5 py-1 rounded-lg border border-rose-400/30">Compliance</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-rose-400 transition">Traffic Fines</h4>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">Track vehicle penalties and violation expenses.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-sky-400/30 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-lg group-hover:shadow-[0_0_20px_rgba(244,63,94,0.8)]">
              ➔
            </div>
          </Link>

          <Link href="/admin/assignments" className="group bg-sky-950/40 backdrop-blur-2xl hover:bg-sky-900/60 p-6 rounded-3xl border border-sky-400/20 hover:border-cyan-400 transition-all duration-300 shadow-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider bg-cyan-500/15 px-2.5 py-1 rounded-lg border border-cyan-400/30">Operations</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-cyan-300 transition">Vehicle Shift Lookup</h4>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">Find out which driver was driving any car on any date.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-sky-400/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all duration-300 shadow-lg group-hover:shadow-[0_0_20px_rgba(6,182,212,0.8)]">
              ➔
            </div>
          </Link>

          <Link href="/admin/calculator" className="group bg-sky-950/40 backdrop-blur-2xl hover:bg-sky-900/60 p-6 rounded-3xl border border-sky-400/20 hover:border-cyan-400 transition-all duration-300 shadow-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider bg-cyan-500/15 px-2.5 py-1 rounded-lg border border-cyan-400/30">Finance</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-cyan-300 transition">Trip Fare Calculator</h4>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">Estimate fuel and fares using Special 95 rates.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-sky-400/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all duration-300 shadow-lg group-hover:shadow-[0_0_20px_rgba(6,182,212,0.8)]">
              ➔
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}