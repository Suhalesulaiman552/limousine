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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Command Center
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">Fleet Operations</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Overview of bookings, fines, and driver shifts.
          </p>
        </div>
        <Link href="/admin/bookings" className="w-full sm:w-auto text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-md">
          + New Booking
        </Link>
      </div>

      {/* Stats Cards Grid (2 cols on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Bookings</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-white">
            {loading ? '...' : bookingsCount}
          </p>
          <span className="text-[10px] sm:text-xs text-emerald-400 mt-1 block">Active</span>
        </div>

        <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Fines Total</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-red-400">
            {loading ? '...' : `AED ${finesTotal.toFixed(0)}`}
          </p>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-1 block">Violations</span>
        </div>

        <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Shifts</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-blue-400">
            {loading ? '...' : assignmentsCount}
          </p>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-1 block">Assigned</span>
        </div>

        <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Database</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-emerald-400">Online</p>
          <span className="text-[10px] sm:text-xs text-slate-400 mt-1 block">Neon DB</span>
        </div>
      </div>

      {/* Quick Navigation Hub */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-white mb-3">Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/bookings" className="group bg-slate-900 hover:bg-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition shadow-lg flex justify-between items-center">
            <div>
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Dispatch</span>
              <h4 className="text-lg font-bold text-white mt-0.5 group-hover:text-amber-300 transition">Client Bookings</h4>
              <p className="text-slate-400 text-xs mt-0.5">Manage scheduled rides.</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition text-sm">
              ➔
            </div>
          </Link>

          <Link href="/admin/fines" className="group bg-slate-900 hover:bg-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-red-500/50 transition shadow-lg flex justify-between items-center">
            <div>
              <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">Compliance</span>
              <h4 className="text-lg font-bold text-white mt-0.5 group-hover:text-red-300 transition">Traffic Fines</h4>
              <p className="text-slate-400 text-xs mt-0.5">Track vehicle penalties.</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition text-sm">
              ➔
            </div>
          </Link>

          <Link href="/admin/assignments" className="group bg-slate-900 hover:bg-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition shadow-lg flex justify-between items-center">
            <div>
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Operations</span>
              <h4 className="text-lg font-bold text-white mt-0.5 group-hover:text-blue-300 transition">Shift Lookup</h4>
              <p className="text-slate-400 text-xs mt-0.5">Find car drivers by date.</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition text-sm">
              ➔
            </div>
          </Link>

          <Link href="/admin/calculator" className="group bg-slate-900 hover:bg-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition shadow-lg flex justify-between items-center">
            <div>
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Finance</span>
              <h4 className="text-lg font-bold text-white mt-0.5 group-hover:text-amber-300 transition">Trip Calculator</h4>
              <p className="text-slate-400 text-xs mt-0.5">Estimate fuel and fares.</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition text-sm">
              ➔
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}