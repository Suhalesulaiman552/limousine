import React from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-amber-400">Al-Suhail Limousine Fleet</h1>
            <p className="text-slate-400 text-sm mt-1">Operations & Management Dashboard (Connected to Neon DB)</p>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-sm">
            Status: <span className="text-emerald-400 font-semibold">● Online</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium">Active Fleet</h3>
            <p className="text-3xl font-bold mt-2 text-white">4 Vehicles</p>
            <span className="text-xs text-amber-400 mt-2 block">Corolla, Camry, Kia, Patrol</span>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium">Today's Bookings</h3>
            <p className="text-3xl font-bold mt-2 text-white">12</p>
            <span className="text-xs text-emerald-400 mt-2 block">+3 scheduled for evening</span>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium">Fuel Cost Tracker</h3>
            <p className="text-3xl font-bold mt-2 text-white">AED 450</p>
            <span className="text-xs text-slate-400 mt-2 block">Special 95 Rate Applied</span>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium">Database Status</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-400">Connected</p>
            <span className="text-xs text-slate-400 mt-2 block">Neon PostgreSQL</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-amber-300">Quick Fleet Control</h2>
          <p className="text-slate-300 text-sm mb-6">
            Manage your daily client calls, calculate route distances, and review trip fares instantly.
          </p>
          <div className="flex gap-4">
            <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-5 py-2.5 rounded-lg transition">
              + New Booking
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-lg transition border border-slate-600">
              Calculate Trip Fare
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}