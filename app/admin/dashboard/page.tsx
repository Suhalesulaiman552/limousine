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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-sky-500/20 text-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Command Center Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight">Fleet Operations Hub</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-md leading-relaxed">
            Real-time telemetry, bookings, compliance tracking, and automated fare estimators.
          </p>
        </div>
        <Link href="/admin/bookings" className="relative z-10 w-full sm:w-auto text-center bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-sky-500/20 hover:scale-105">
          + New Booking
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl hover:border-sky-500/30 transition">
          <h3 className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">Total Bookings</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-white">
            {loading ? '...' : bookingsCount}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-[10px] sm:text-xs text-sky-400 font-bold">Synced with DB</span>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl hover:border-red-500/30 transition">
          <h3 className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">Traffic Fines Total</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-red-500">
            {loading ? '...' : `AED ${finesTotal.toFixed(0)}`}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-red-400 font-bold">Violation Alerts</span>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl hover:border-sky-500/30 transition">
          <h3 className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">Shift Assignments</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-sky-400">
            {loading ? '...' : assignmentsCount}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold">Active Drivers</span>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl hover:border-emerald-500/30 transition">
          <h3 className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">Neon Database</h3>
          <p className="text-3xl sm:text-4xl font-black mt-3 text-emerald-400">Online</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] sm:text-xs text-emerald-400 font-bold">PostgreSQL Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Hub */}
      <div>
        <h3 className="text-lg font-black text-white mb-4 tracking-wide">Management Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link href="/admin/bookings" className="group bg-slate-900 hover:bg-slate-850 p-6 rounded-3xl border border-slate-800 hover:border-sky-500/50 transition-all duration-200 shadow-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-sky-400 font-black uppercase tracking-wider bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">Dispatch</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-sky-400 transition">Client Bookings</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage scheduled client rides and dispatch.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all duration-200 shadow-md">
              ➔
            </div>
          </Link>

          <Link href="/admin/fines" className="group bg-slate-900 hover:bg-slate-850 p-6 rounded-3xl border border-slate-800 hover:border-red-500/50 transition-all duration-200 shadow-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-red-400 font-black uppercase tracking-wider bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">Compliance</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-red-400 transition">Traffic Fines</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Track vehicle penalties and violation expenses.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition-all duration-200 shadow-md">
              ➔
            </div>
          </Link>

          <Link href="/admin/assignments" className="group bg-slate-900 hover:bg-slate-850 p-6 rounded-3xl border border-slate-800 hover:border-sky-500/50 transition-all duration-200 shadow-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-sky-400 font-black uppercase tracking-wider bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">Operations</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-sky-400 transition">Vehicle Shift Lookup</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Find out which driver was driving any car on any date.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all duration-200 shadow-md">
              ➔
            </div>
          </Link>

          <Link href="/admin/calculator" className="group bg-slate-900 hover:bg-slate-850 p-6 rounded-3xl border border-slate-800 hover:border-sky-500/50 transition-all duration-200 shadow-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-sky-400 font-black uppercase tracking-wider bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">Finance</span>
              <h4 className="text-xl font-black text-white mt-3 group-hover:text-sky-400 transition">Trip Fare Calculator</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Estimate fuel and fares using Special 95 rates.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all duration-200 shadow-md">
              ➔
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}