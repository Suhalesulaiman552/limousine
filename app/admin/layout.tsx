'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AttendanceRecord {
  day: number;
  status: string;
}

interface Client {
  id: string;
  name: string;
  route: string;
  type: string;
  vehicle: string;
  monthlyFee: number;
  attendance: AttendanceRecord[];
}

export default function MonthlyDirectoryPage() {
  const router = useRouter();
  
  // Date state: default to current month/year or 2026-10
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Form state for adding a new client
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newRoute, setNewRoute] = useState<string>('');
  const [newVehicle, setNewVehicle] = useState<string>('Toyota Camry');
  const [newFee, setNewFee] = useState<string>('1200');

  // Format monthKey for API (e.g. "2026-10")
  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  // Calculate exact days in the selected month dynamically
  const totalDaysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  // Fetch clients and attendance for the selected month
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/monthly?monthKey=${monthKey}`);
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      setClients(data);
    } catch {
      setError('Could not load monthly directory data.');
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Handle attendance toggle for a specific day
  const handleToggleAttendance = async (clientId: string, day: number, currentStatus?: string) => {
    let nextStatus: string | null = 'completed';
    if (currentStatus === 'completed') nextStatus = 'cancelled';
    else if (currentStatus === 'cancelled') nextStatus = null;

    // Optimistic UI update
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const updatedAttendance = c.attendance.filter((a) => a.day !== day);
        if (nextStatus) {
          updatedAttendance.push({ day, status: nextStatus });
        }
        return { ...c, attendance: updatedAttendance };
      })
    );

    try {
      await fetch('/api/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'attendance',
          clientId,
          monthKey,
          day,
          status: nextStatus,
        }),
      });
    } catch {
      console.error('Failed to update attendance');
      fetchClients();
    }
  };

  // Handle creating a new client
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newName,
          route: newRoute,
          vehicle: newVehicle,
          monthlyFee: parseFloat(newFee) || 1200,
        }),
      });

      if (res.ok) {
        setNewName('');
        setNewRoute('');
        setShowAddModal(false);
        fetchClients();
      }
    } catch {
      console.error('Failed to create client');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar with Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-[0_4px_24px_0_rgba(2,132,199,0.06)]">
        <div>
          <h2 className="text-lg font-medium text-slate-900 tracking-tight">Monthly Client Attendance & Trips</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track daily dispatch schedules across all months and years.</p>
        </div>

        {/* Month & Year Selectors */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-white border border-sky-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-cyan-500 shadow-sm"
          >
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map((m, index) => (
              <option key={index + 1} value={index + 1}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-sky-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-cyan-500 shadow-sm"
          >
            {[2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-medium text-xs px-4 py-2 rounded-xl transition shadow-[0_0_15px_rgba(6,182,212,0.3)] whitespace-nowrap"
          >
            + Add Client
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs text-center">
          {error}
        </div>
      )}

      {/* Calendar Grid Table */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl overflow-x-auto shadow-[0_4px_24px_0_rgba(2,132,199,0.06)]">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs tracking-wider">LOADING ATTENDANCE MATRIX...</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">No clients found for this month. Click "+ Add Client" above to get started!</div>
        ) : (
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr className="border-b border-sky-100 text-left text-xs text-slate-500 bg-white/40">
                <th className="p-4 sticky left-0 bg-white/90 backdrop-blur-md z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Client / Route</th>
                {daysArray.map((day) => {
                  const dateObj = new Date(selectedYear, selectedMonth - 1, day);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                  return (
                    <th key={day} className={`p-2 text-center text-[10px] w-9 ${isWeekend ? 'bg-sky-50/80 text-cyan-700 font-semibold' : ''}`}>
                      <div className="text-slate-400 font-light">{dayName}</div>
                      <div className="font-bold text-slate-800 mt-0.5">{day}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/60 text-xs">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/80 transition">
                  <td className="p-4 sticky left-0 bg-white/90 backdrop-blur-md z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <div className="font-medium text-slate-900">{client.name}</div>
                    <div className="text-[10px] text-slate-500">{client.route} • {client.vehicle}</div>