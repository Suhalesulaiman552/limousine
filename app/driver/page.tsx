'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DriverDashboard() {
  const [status, setStatus] = useState('AVAILABLE');
  const [driverName, setDriverName] = useState('Driver');
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setDriverName(user.username);
    }
  }, []);

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    await fetch('/api/driver/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId: user.driverId, status: newStatus }),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 p-6 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      <div className="max-w-md mx-auto w-full space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <p className="text-[11px] uppercase tracking-widest text-sky-600 font-extrabold">Al-Suhail Driver Portal</p>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 capitalize">Welcome, {driverName}</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 px-4 py-2.5 rounded-2xl transition-all">
            Sign Out
          </button>
        </div>

        {/* Live Operational Status Card */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-3">
          <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Live Operational Status</label>
          <div className="grid grid-cols-3 gap-2.5">
            <button 
              onClick={() => updateStatus('AVAILABLE')}
              className={`py-3 px-2 rounded-2xl font-bold text-xs transition-all duration-200 flex flex-col items-center gap-1.5 ${status === 'AVAILABLE' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 scale-[1.02]' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
              <span className={`w-2 h-2 rounded-full ${status === 'AVAILABLE' ? 'bg-white' : 'bg-emerald-500'}`}></span>
              Available
            </button>
            <button 
              onClick={() => updateStatus('ON_TRIP')}
              className={`py-3 px-2 rounded-2xl font-bold text-xs transition-all duration-200 flex flex-col items-center gap-1.5 ${status === 'ON_TRIP' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 scale-[1.02]' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
              <span className={`w-2 h-2 rounded-full ${status === 'ON_TRIP' ? 'bg-white' : 'bg-blue-500'}`}></span>
              On Trip
            </button>
            <button 
              onClick={() => updateStatus('NOT_AVAILABLE')}
              className={`py-3 px-2 rounded-2xl font-bold text-xs transition-all duration-200 flex flex-col items-center gap-1.5 ${status === 'NOT_AVAILABLE' ? 'bg-slate-800 text-white shadow-md scale-[1.02]' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
              <span className={`w-2 h-2 rounded-full ${status === 'NOT_AVAILABLE' ? 'bg-white' : 'bg-slate-400'}`}></span>
              Offline
            </button>
          </div>
        </div>

        {/* Action Navigation Cards */}
        <div className="space-y-3.5">
          <a href="/driver/trip/add" className="group flex items-center justify-between p-5 rounded-3xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-600/20 hover:scale-[1.01] transition-all duration-200">
            <div>
              <p className="text-base font-bold">Add New Trip</p>
              <p className="text-xs text-sky-100 opacity-90 mt-0.5">Record client destination, passengers, and fare</p>
            </div>
            <span className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg group-hover:translate-x-1 transition-transform">→</span>
          </a>

          <a href="/driver/petrol/add" className="group flex items-center justify-between p-5 rounded-3xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-600/20 hover:scale-[1.01] transition-all duration-200">
            <div>
              <p className="text-base font-bold">Log Petrol Expense</p>
              <p className="text-xs text-teal-100 opacity-90 mt-0.5">Upload receipt image and record fuel refuel</p>
            </div>
            <span className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg group-hover:translate-x-1 transition-transform">⛽</span>
          </a>
        </div>

      </div>

      <div className="mt-8 text-center text-xs text-slate-400 font-medium">
        Al-Suhail Fleet Management System v2.0
      </div>
    </div>
  );
}