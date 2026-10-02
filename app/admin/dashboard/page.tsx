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
      <div className="bg-black text-white p-5 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-sky-700">
        <div>
          <span className="bg-sky-600 text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Command Center
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">Fleet Operations</h2>
          <p className="text-sky-200 text-xs sm:text-sm mt-1">
            Overview of bookings, fines, and driver shifts.
          </p>
        </div>
        <Link href="/admin/bookings" className="w-full sm:w-auto text-center bg-sky-500 hover:bg-sky-400 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-md">
          + New Booking
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-sky-700 shadow-md">
          <h3 className="text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider">Bookings</h3>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-black">
            {loading ? '...' : bookingsCount}
          </p>
          <span className="text-[10px] sm:text-xs text-sky-700 font-bold mt-1 block">Active</span>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-sky-700 shadow-md">
          <h3 className="text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider">Fines Total</h3>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-red-600">
            {loading ? '...' : `AED ${finesTotal.toFixed(0)}`}
          </p>
          <span className="text-[10px] sm:text-xs text-red-600 font-bold mt-1 block">Violations Alert</span>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-sky-700 shadow-md">
          <h3 className="text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider">Shifts</h3>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-sky-800">
            {loading ? '...' : assignmentsCount}
          </p>
          <span className="text-[10px] sm:text-xs text-sky-700 font-bold mt-1 block">Assigned</span>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-sky-700 shadow-md">
          <h3 className="text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider">Database</h3>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-emerald-600">Online</p>
          <span className="text-[10px] sm:text-xs text-emerald-600 font-bold mt-1 block">Neon DB</span>
        </div>
      </div>

      {/* Quick Navigation Hub */}
      <div>
        <h3 className="text-base sm:text-lg font-extrabold text-white mb-3">Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/bookings" className="group bg-white hover:bg-sky-50 p-5 rounded-2xl border border-sky-700 transition shadow-md flex justify-between items-center">
            <div>
              <span className="text-[10px] text-sky-700 font-extrabold uppercase tracking-wider">Dispatch</span>
              <h4 className="text-lg font-black text-black mt-0.5 group-hover:text-sky-800 transition">Client Bookings</h4>
              <p className="text-black text-xs mt-0.5 font-medium">Manage scheduled rides.</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black group-hover:bg-sky-600 transition text-sm">
              ➔
            </div>
          </Link>

          <Link href="/admin/fines" className="group bg-white hover:bg-red-50 p-5 rounded-2xl border border-sky-700 transition shadow-md flex justify-between items-center">
            <div>
              <span className="text-[10px] text-red-600 font-extrabold uppercase tracking-wider">Compliance</span>
              <h4 className="text-lg font-black text-black mt-0.5 group-hover:text-red-700 transition">Traffic Fines</h4>
              <p className="text-black text-xs mt-0.5 font-medium">Track vehicle penalties.</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black group-hover:bg-black transition text-sm">
              ➔
            </div>
          </Link>

          <Link href="/admin/assignments" className="group bg-white hover:bg-sky-50 p-5 rounded-2xl border border-sky-700 transition shadow-md flex justify-between items-center">
            <div>
              <span className="text-[10px] text-sky-700 font-extrabold uppercase tracking-wider">Operations</span>
              <h4 className="text-lg font-black text-black mt-0.5 group-hover:text-sky-800 transition">Shift Lookup</h4>
              <p className="text-black text-xs mt-0.5 font-medium">Find car drivers by date.</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black group-hover:bg-sky-600 transition text-sm">
              ➔
            </div>
          </Link>

          <Link href="/admin/calculator" className="group bg-white hover:bg-sky-50 p-5 rounded-2xl border border-sky-700 transition shadow-md flex justify-between items-center">
            <div>
              <span className="text-[10px] text-sky-700 font-extrabold uppercase tracking-wider">Finance</span>
              <h4 className="text-lg font-black text-black mt-0.5 group-hover:text-sky-800 transition">Trip Calculator</h4>
              <p className="text-black text-xs mt-0.5 font-medium">Estimate fuel and fares.</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black group-hover:bg-sky-600 transition text-sm">
              ➔
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}