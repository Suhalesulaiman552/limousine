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
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Command Center
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-3">Al-Suhail Limousine Fleet</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Monitor live operations, track vehicle shift history, oversee traffic fines, and calculate trip fares across your fleet.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/bookings" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-amber-500/10">
            + New Booking
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Bookings</h3>
          <p className="text-3xl font-bold mt-3 text-white">
            {loading ? '...' : bookingsCount}
          </p>
          <span className="text-xs text-emerald-400 mt-2 block flex items-center gap-1">
            ● Active in database
          </span>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none" />
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Traffic Fines Total</h3>
          <p className="text-3xl font-bold mt-3 text-red-400">
            {loading ? '...' : `AED ${finesTotal.toFixed(2)}`}
          </p>
          <span className="text-xs text-slate-400 mt-2 block">
            Fleet infraction records
          </span>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Shift Assignments</h3>
          <p className="text-3xl font-bold mt-3 text-blue-400">
            {loading ? '...' : assignmentsCount}
          </p>
          <span className="text-xs text-slate-400 mt-2 block">
            Logged vehicle drivers
          </span>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Database Status</h3>
          <p className="text-3xl font-bold mt-3 text-emerald-400">Online</p>
          <span className="text-xs text-slate-400 mt-2 block">Neon PostgreSQL</span>
        </div>
      </div>

      {/* Quick Navigation Hub */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Management Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/bookings" className="group bg-slate-900 hover:bg-slate-850 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition shadow-lg flex justify-between items-center">
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Dispatch Center</span>
              <h4 className="text-xl font-bold text-white mt-1 group-hover:text-amber-300 transition">Client Bookings</h4>
              <p className="text-slate-400 text-sm mt-1">Manage scheduled rides and log new client trips.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              ➔
            </div>
          </Link>

          <Link href="/admin/fines" className="group bg-slate-900 hover:bg-slate-850 p-6 rounded-2xl border border-slate-800 hover:border-red-500/50 transition shadow-lg flex justify-between items-center">
            <div>
              <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Compliance</span>
              <h4 className="text-xl font-bold text-white mt-1 group-hover:text-red-300 transition">Traffic Fines</h4>
              <p className="text-slate-400 text-sm mt-1">Track vehicle penalties and violation expenses.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition">
              ➔
            </div>
          </Link>

          <Link href="/admin/assignments" className="group bg-slate-900 hover:bg-slate-850 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition shadow-lg flex justify-between items-center">
            <div>
              <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Operations</span>
              <h4 className="text-xl font-bold text-white mt-1 group-hover:text-blue-300 transition">Vehicle Shift Lookup</h4>
              <p className="text-slate-400 text-sm mt-1">Find out which driver was driving any car on any date.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
              ➔
            </div>
          </Link>

          <Link href="/admin/calculator" className="group bg-slate-900 hover:bg-slate-850 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition shadow-lg flex justify-between items-center">
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Finance</span>
              <h4 className="text-xl font-bold text-white mt-1 group-hover:text-amber-300 transition">Trip Fare Calculator</h4>
              <p className="text-slate-400 text-sm mt-1">Estimate fuel cost and fares using Special 95 rates.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              ➔
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}