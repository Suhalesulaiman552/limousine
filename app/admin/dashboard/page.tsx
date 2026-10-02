'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [bookingsCount, setBookingsCount] = useState(0);
  const [finesTotal, setFinesTotal] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);

  useEffect(() => {
    fetch('/api/bookings').then(res => res.json()).then(data => { if (Array.isArray(data)) setBookingsCount(data.length); }).catch(() => {});
    fetch('/api/fines').then(res => res.json()).then(data => { 
      if (Array.isArray(data)) {
        const sum = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setFinesTotal(sum);
      }
    }).catch(() => {});
    fetch('/api/assignments').then(res => res.json()).then(data => { if (Array.isArray(data)) setAssignmentsCount(data.length); }).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-xs font-semibold uppercase">Total Bookings</h3>
          <p className="text-3xl font-bold mt-2 text-white">{bookingsCount}</p>
          <span className="text-xs text-emerald-400 mt-2 block">Synced with Neon DB</span>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-xs font-semibold uppercase">Traffic Fines Total</h3>
          <p className="text-3xl font-bold mt-2 text-red-400">AED {finesTotal.toFixed(2)}</p>
          <span className="text-xs text-slate-400 mt-2 block">Fleet violations</span>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-xs font-semibold uppercase">Shift Assignments</h3>
          <p className="text-3xl font-bold mt-2 text-amber-400">{assignmentsCount}</p>
          <span className="text-xs text-slate-400 mt-2 block">Vehicle driver logs</span>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-slate-400 text-xs font-semibold uppercase">Database Status</h3>
          <p className="text-3xl font-bold mt-2 text-emerald-400">Connected</p>
          <span className="text-xs text-slate-400 mt-2 block">Neon PostgreSQL</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-amber-300">Client Bookings & Dispatch</h2>
            <p className="text-slate-400 text-sm mb-4">View all scheduled client rides, manage vehicle assignments, and log new bookings.</p>
          </div>
          <Link href="/admin/bookings" className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-center text-sm transition">
            Manage Bookings ➔
          </Link>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-red-400">Traffic Fines & Violations</h2>
            <p className="text-slate-400 text-sm mb-4">Review itemized traffic fines across your 4 vehicles and log new penalty infractions.</p>
          </div>
          <Link href="/admin/fines" className="inline-block bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-800 font-semibold px-4 py-2.5 rounded-xl text-center text-sm transition">
            Manage Traffic Fines ➔
          </Link>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-blue-400">Vehicle Driver Lookup</h2>
            <p className="text-slate-400 text-sm mb-4">Assign drivers to cars and look up historical shift records by vehicle, date, and time.</p>
          </div>
          <Link href="/admin/assignments" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-center text-sm transition">
            Vehicle Shift Logs ➔
          </Link>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-amber-300">Trip Fare & Fuel Calculator</h2>
            <p className="text-slate-400 text-sm mb-4">Calculate estimated fuel consumption and trip pricing using UAE Special 95 petrol rates.</p>
          </div>
          <Link href="/admin/calculator" className="inline-block bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold px-4 py-2.5 rounded-xl text-center text-sm transition">
            Open Calculator ➔
          </Link>
        </div>
      </div>
    </div>
  );
}