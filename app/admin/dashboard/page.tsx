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
      {/* Master Organic Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2c382b] via-[#3a4d38] to-[#1e271d] text-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#0284c7]/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#84cc16]/10 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="relative z-10">
          <span className="bg-white/15 border border-white/25 text-[#dce5d3] text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            Command Center Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white">Fleet Operations Hub</h2>
          <p className="text-[#dce5d3] text-xs sm:text-sm mt-1 max-w-md leading-relaxed">
            Synchronized telemetry, live bookings, compliance tracking, and automated fare engines.
          </p>
        </div>
        <Link href="/admin/bookings" className="relative z-10 w-full sm:w-auto text-center bg-[#0284c7] hover:bg-[#0369a1] text-white font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all duration-300 shadow-[0_0_25px_rgba(2,132,199,0.5)] hover:scale-105">
          + New Booking
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white/90 backdrop-blur-xl border border-stone-200/90 p-5 sm:p-6 rounded-2xl shadow-xl shadow-stone-900/5 hover:border-[#0284c7]/50 transition">
          <h3 className="text-[#5c6e5a] text-[10px] sm:text-xs font-black uppercase tracking-wider">Total Bookings</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-[#1a2319]">
            {loading ? '...' : bookingsCount}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
            <span className="text-[10px] sm:text-xs text-[#0284c7] font-bold">Neon Synced</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-stone-200/90 p-5 sm:p-6 rounded-2xl shadow-xl shadow-stone-900/5 hover:border-rose-400 transition">
          <h3 className="text-[#5c6e5a] text-[10px] sm:text-xs font-black uppercase tracking-wider">Traffic Fines Total</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-rose-600">
            {loading ? '...' : `AED ${finesTotal.toFixed(0)}`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-rose-600 font-bold">Violation Alerts</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-stone-200/90 p-5 sm:p-6 rounded-2xl shadow-xl shadow-stone-900/5 hover:border-[#2c382b]/50 transition">
          <h3 className="text-[#5c6e5a] text-[10px] sm:text-xs font-black uppercase tracking-wider">Shift Assignments</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-[#2c382b]">
            {loading ? '...' : assignmentsCount}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#2c382b]" />
            <span className="text-[10px] sm:text-xs text-[#5c6e5a] font-bold">Active Drivers</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-stone-200/90 p-5 sm:p-6 rounded-2xl shadow-xl shadow-stone-900/5 hover:border-emerald-500/50 transition">
          <h3 className="text-[#5c6e5a] text-[10px] sm:text-xs font-black uppercase tracking-wider">Database Status</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-emerald-600">Online</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] sm:text-xs text-emerald-600 font-bold">PostgreSQL Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Hub */}
      <div>
        <h3 className="text-lg font-black text-[#2c382b] mb-4 tracking-wider uppercase text-xs">Management Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link href="/admin/bookings" className="group bg-white/90 backdrop-blur-xl hover:bg-white p-6 rounded-3xl border border-stone-200/90 hover:border-[#0284c7]/50 transition-all duration-300 shadow-xl shadow-stone-900/5 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#0284c7] font-black uppercase tracking-wider bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">Dispatch</span>
              <h4 className="text-xl font-black text-[#1a2319] mt-3 group-hover:text-[#0284c7] transition">Client Bookings</h4>
              <p className="text-[#5c6e5a] text-xs sm:text-sm mt-1">Manage scheduled client rides and dispatch.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-[#2c382b] group-hover:bg-[#0284c7] group-hover:text-white transition-all duration-300 shadow-md">
              ➔
            </div>
          </Link>

          <Link href="/admin/fines" className="group bg-white/90 backdrop-blur-xl hover:bg-white p-6 rounded-3xl border border-stone-200/90 hover:border-rose-400 transition-all duration-300 shadow-xl shadow-stone-900/5 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-rose-600 font-black uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">Compliance</span>
              <h4 className="text-xl font-black text-[#1a2319] mt-3 group-hover:text-rose-600 transition">Traffic Fines</h4>
              <p className="text-[#5c6e5a] text-xs sm:text-sm mt-1">Track vehicle penalties and violation expenses.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-md">
              ➔
            </div>
          </Link>

          <Link href="/admin/assignments" className="group bg-white/90 backdrop-blur-xl hover:bg-white p-6 rounded-3xl border border-stone-200/90 hover:border-[#2c382b]/50 transition-all duration-300 shadow-xl shadow-stone-900/5 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#2c382b] font-black uppercase tracking-wider bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">Operations</span>
              <h4 className="text-xl font-black text-[#1a2319] mt-3 group-hover:text-[#2c382b] transition">Vehicle Shift Lookup</h4>
              <p className="text-[#5c6e5a] text-xs sm:text-sm mt-1">Find out which driver was driving any car on any date.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-[#2c382b] group-hover:bg-[#2c382b] group-hover:text-white transition-all duration-300 shadow-md">
              ➔
            </div>
          </Link>

          <Link href="/admin/calculator" className="group bg-white/90 backdrop-blur-xl hover:bg-white p-6 rounded-3xl border border-stone-200/90 hover:border-[#0284c7]/50 transition-all duration-300 shadow-xl shadow-stone-900/5 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#0284c7] font-black uppercase tracking-wider bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">Finance</span>
              <h4 className="text-xl font-black text-[#1a2319] mt-3 group-hover:text-[#0284c7] transition">Trip Fare Calculator</h4>
              <p className="text-[#5c6e5a] text-xs sm:text-sm mt-1">Estimate fuel and fares using Special 95 rates.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-[#2c382b] group-hover:bg-[#0284c7] group-hover:text-white transition-all duration-300 shadow-md">
              ➔
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}