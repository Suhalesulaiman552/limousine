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
      {/* Asymmetrical Master Banner with Diagonal Cut */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0284c7] via-sky-600 to-blue-800 text-slate-950 p-6 sm:p-8 rounded-[2.5rem] rounded-bl-none shadow-[0_15px_50px_rgba(2,132,199,0.4)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-sky-300/30">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-200/30 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <span className="bg-slate-950 text-sky-300 text-[10px] sm:text-xs font-black px-4 py-1.5 rounded-full rounded-tr-none uppercase tracking-widest shadow-md">
            Command Center Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white">Fleet Operations Hub</h2>
          <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-md font-medium leading-relaxed">
            Synchronized telemetry, live bookings, compliance tracking, and automated fare engines.
          </p>
        </div>
        <Link href="/admin/bookings" className="relative z-10 w-full sm:w-auto text-center bg-slate-950 hover:bg-slate-900 text-cyan-300 font-black px-6 py-3.5 rounded-2xl rounded-tl-none text-xs sm:text-sm transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:scale-105">
          + New Booking
        </Link>
      </div>

      {/* Stats Cards Grid (Distinct Sculptural Shapes per Card) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#f4f6f0] text-[#1a2319] p-5 sm:p-6 rounded-[2rem] rounded-tr-none shadow-xl border border-white/20 hover:border-[#0284c7] transition">
          <h3 className="text-[#5c6e5a] text-[10px] sm:text-xs font-black uppercase tracking-wider">Total Bookings</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-[#1a2319]">
            {loading ? '...' : bookingsCount}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rotate-45 bg-[#0284c7]" />
            <span className="text-[10px] sm:text-xs text-[#0284c7] font-bold">Neon Synced</span>
          </div>
        </div>

        <div className="bg-[#f4f6f0] text-[#1a2319] p-5 sm:p-6 rounded-[2rem] rounded-bl-none shadow-xl border border-white/20 hover:border-rose-500 transition">
          <h3 className="text-[#5c6e5a] text-[10px] sm:text-xs font-black uppercase tracking-wider">Traffic Fines Total</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-rose-600">
            {loading ? '...' : `AED ${finesTotal.toFixed(0)}`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rotate-45 bg-rose-600 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-rose-600 font-bold">Violation Alerts</span>
          </div>
        </div>

        <div className="bg-[#f4f6f0] text-[#1a2319] p-5 sm:p-6 rounded-[2rem] rounded-tl-none shadow-xl border border-white/20 hover:border-[#2c382b] transition">
          <h3 className="text-[#5c6e5a] text-[10px] sm:text-xs font-black uppercase tracking-wider">Shift Assignments</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-[#2c382b]">
            {loading ? '...' : assignmentsCount}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rotate-45 bg-[#2c382b]" />
            <span className="text-[10px] sm:text-xs text-[#5c6e5a] font-bold">Active Drivers</span>
          </div>
        </div>

        <div className="bg-[#f4f6f0] text-[#1a2319] p-5 sm:p-6 rounded-[2rem] rounded-br-none shadow-xl border border-white/20 hover:border-emerald-600 transition">
          <h3 className="text-[#5c6e5a] text-[10px] sm:text-xs font-black uppercase tracking-wider">Database Status</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-emerald-600">Online</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rotate-45 bg-emerald-600" />
            <span className="text-[10px] sm:text-xs text-emerald-600 font-bold">PostgreSQL Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Hub (Trapezoidal / Chamfered Modules) */}
      <div>
        <h3 className="text-lg font-black text-[#dce5d3] mb-4 tracking-wider uppercase text-xs">Management Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link href="/admin/bookings" className="group bg-[#f4f6f0] hover:bg-white p-6 rounded-[2.5rem] rounded-tr-none border border-white/20 hover:border-[#0284c7] transition-all duration-300 shadow-2xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#0284c7] font-black uppercase tracking-wider bg-sky-100 px-3 py-1 rounded-full rounded-bl-none border border-sky-200">Dispatch</span>
              <h4 className="text-xl font-black text-[#1a2319] mt-3 group-hover:text-[#0284c7] transition">Client Bookings</h4>
              <p className="text-[#5c6e5a] text-xs sm:text-sm mt-1">Manage scheduled client rides and dispatch.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl rounded-br-none bg-[#2c382b] text-white flex items-center justify-center group-hover:bg-[#0284c7] transition-all duration-300 shadow-md">
              ➔
            </div>
          </Link>

          <Link href="/admin/fines" className="group bg-[#f4f6f0] hover:bg-white p-6 rounded-[2.5rem] rounded-tl-none border border-white/20 hover:border-rose-500 transition-all duration-300 shadow-2xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-rose-600 font-black uppercase tracking-wider bg-rose-100 px-3 py-1 rounded-full rounded-br-none border border-rose-200">Compliance</span>
              <h4 className="text-xl font-black text-[#1a2319] mt-3 group-hover:text-rose-600 transition">Traffic Fines</h4>
              <p className="text-[#5c6e5a] text-xs sm:text-sm mt-1">Track vehicle penalties and violation expenses.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl rounded-bl-none bg-[#2c382b] text-white flex items-center justify-center group-hover:bg-rose-600 transition-all duration-300 shadow-md">
              ➔
            </div>
          </Link>

          <Link href="/admin/assignments" className="group bg-[#f4f6f0] hover:bg-white p-6 rounded-[2.5rem] rounded-bl-none border border-white/20 hover:border-[#2c382b] transition-all duration-300 shadow-2xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#2c382b] font-black uppercase tracking-wider bg-stone-200 px-3 py-1 rounded-full rounded-tr-none border border-stone-300">Operations</span>
              <h4 className="text-xl font-black text-[#1a2319] mt-3 group-hover:text-[#2c382b] transition">Vehicle Shift Lookup</h4>
              <p className="text-[#5c6e5a] text-xs sm:text-sm mt-1">Find out which driver was driving any car on any date.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl rounded-tr-none bg-[#2c382b] text-white flex items-center justify-center group-hover:bg-black transition-all duration-300 shadow-md">
              ➔
            </div>
          </Link>

          <Link href="/admin/calculator" className="group bg-[#f4f6f0] hover:bg-white p-6 rounded-[2.5rem] rounded-br-none border border-white/20 hover:border-[#0284c7] transition-all duration-300 shadow-2xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#0284c7] font-black uppercase tracking-wider bg-sky-100 px-3 py-1 rounded-full rounded-tl-none border border-sky-200">Finance</span>
              <h4 className="text-xl font-black text-[#1a2319] mt-3 group-hover:text-[#0284c7] transition">Trip Fare Calculator</h4>
              <p className="text-[#5c6e5a] text-xs sm:text-sm mt-1">Estimate fuel and fares using Special 95 rates.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl rounded-tl-none bg-[#2c382b] text-white flex items-center justify-center group-hover:bg-[#0284c7] transition-all duration-300 shadow-md">
              ➔
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}