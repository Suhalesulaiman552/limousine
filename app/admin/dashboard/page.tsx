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
      {/* Cinematic Luminous Master Banner with Night-Movie Color Grading */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-700 text-white p-6 sm:p-8 rounded-3xl shadow-[0_15px_50px_rgba(6,182,212,0.4)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-cyan-300/50">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/40 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-200/40 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="relative z-10">
          <span className="bg-slate-950/30 border border-white/40 text-cyan-200 text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.3)] backdrop-blur-md">
            Command Center Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white drop-shadow-md">Fleet Operations Hub</h2>
          <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-md font-medium leading-relaxed">
            Synchronized telemetry, live bookings, compliance tracking, and automated fare engines.
          </p>
        </div>
        <Link href="/admin/bookings" className="relative z-10 w-full sm:w-auto text-center bg-white hover:bg-sky-50 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all duration-300 shadow-[0_0_35px_rgba(6,182,212,0.8)] hover:scale-105">
          + New Booking
        </Link>
      </div>

      {/* Stats Cards Grid (Floating Transparent Holographic Glass with Neon Edge Reflections) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white/40 backdrop-blur-2xl border border-cyan-300/70 p-5 sm:p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(2,132,199,0.12)] hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300">
          <h3 className="text-cyan-800 text-[10px] sm:text-xs font-black uppercase tracking-wider">Total Bookings</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-slate-900 drop-shadow-sm">
            {loading ? '...' : bookingsCount}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
            <span className="text-[10px] sm:text-xs text-cyan-800 font-bold">Neon Synced</span>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-2xl border border-rose-300/70 p-5 sm:p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(244,63,94,0.1)] hover:border-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] transition-all duration-300">
          <h3 className="text-rose-700 text-[10px] sm:text-xs font-black uppercase tracking-wider">Traffic Fines Total</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-rose-600 drop-shadow-sm">
            {loading ? '...' : `AED ${finesTotal.toFixed(0)}`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse" />
            <span className="text-[10px] sm:text-xs text-rose-700 font-bold">Violation Alerts</span>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-2xl border border-cyan-300/70 p-5 sm:p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(2,132,199,0.12)] hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300">
          <h3 className="text-cyan-800 text-[10px] sm:text-xs font-black uppercase tracking-wider">Shift Assignments</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-sky-900 drop-shadow-sm">
            {loading ? '...' : assignmentsCount}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
            <span className="text-[10px] sm:text-xs text-slate-700 font-bold">Active Drivers</span>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-2xl border border-emerald-300/70 p-5 sm:p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(16,185,129,0.1)] hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-300">
          <h3 className="text-emerald-700 text-[10px] sm:text-xs font-black uppercase tracking-wider">Database Status</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-emerald-600 drop-shadow-sm">Online</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
            <span className="text-[10px] sm:text-xs text-emerald-700 font-bold">PostgreSQL Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Hub (Cinematic Holographic Glass Modules) */}
      <div>
        <h3 className="text-lg font-black text-slate-800 mb-4 tracking-wider uppercase text-xs">Management Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link href="/admin/bookings" className="group bg-white/40 backdrop-blur-2xl hover:bg-white/70 p-6 rounded-3xl border border-cyan-300/70 hover:border-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 shadow-[0_8px_32px_0_rgba(2,132,199,0.1)] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-cyan-800 font-black uppercase tracking-wider bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/50 shadow-sm">Dispatch</span>
              <h4 className="text-xl font-black text-slate-900 mt-3 group-hover:text-cyan-600 transition">Client Bookings</h4>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">Manage scheduled client rides and dispatch.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-300 flex items-center justify-center text-cyan-600 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-sky-500 group-hover:text-white transition-all duration-300 shadow-md group-hover:shadow-[0_0_25px_rgba(6,182,212,0.8)]">
              ➔
            </div>
          </Link>

          <Link href="/admin/fines" className="group bg-white/40 backdrop-blur-2xl hover:bg-white/70 p-6 rounded-3xl border border-rose-300/70 hover:border-rose-500 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all duration-300 shadow-[0_8px_32px_0_rgba(244,63,94,0.1)] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-rose-700 font-black uppercase tracking-wider bg-rose-500/20 px-3 py-1 rounded-full border border-rose-400/50 shadow-sm">Compliance</span>
              <h4 className="text-xl font-black text-slate-900 mt-3 group-hover:text-rose-600 transition">Traffic Fines</h4>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">Track vehicle penalties and violation expenses.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-300 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-md group-hover:shadow-[0_0_25px_rgba(244,63,94,0.8)]">
              ➔
            </div>
          </Link>

          <Link href="/admin/assignments" className="group bg-white/40 backdrop-blur-2xl hover:bg-white/70 p-6 rounded-3xl border border-cyan-300/70 hover:border-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 shadow-[0_8px_32px_0_rgba(2,132,199,0.1)] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-cyan-800 font-black uppercase tracking-wider bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/50 shadow-sm">Operations</span>
              <h4 className="text-xl font-black text-slate-900 mt-3 group-hover:text-cyan-600 transition">Vehicle Shift Lookup</h4>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">Find out which driver was driving any car on any date.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-300 flex items-center justify-center text-cyan-600 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-sky-500 group-hover:text-white transition-all duration-300 shadow-md group-hover:shadow-[0_0_25px_rgba(6,182,212,0.8)]">
              ➔
            </div>
          </Link>

          <Link href="/admin/calculator" className="group bg-white/40 backdrop-blur-2xl hover:bg-white/70 p-6 rounded-3xl border border-cyan-300/70 hover:border-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 shadow-[0_8px_32px_0_rgba(2,132,199,0.1)] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-cyan-800 font-black uppercase tracking-wider bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/50 shadow-sm">Finance</span>
              <h4 className="text-xl font-black text-slate-900 mt-3 group-hover:text-cyan-600 transition">Trip Fare Calculator</h4>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">Estimate fuel and fares using Special 95 rates.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-300 flex items-center justify-center text-cyan-600 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-sky-500 group-hover:text-white transition-all duration-300 shadow-md group-hover:shadow-[0_0_25px_rgba(6,182,212,0.8)]">
              ➔
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}