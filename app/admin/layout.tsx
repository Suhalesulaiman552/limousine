'use client';

import { useState, useEffect, useCallback } from 'react';

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
  // Default to current year and month (October 2026)
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

  // Calculate exact days in the selected month dynamically (handles 28, 30, 31 days)
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
      {/* Header Bar with Month & Year Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-[0_4px_24px_0_rgba(2,132,199,0.06)]">
        <div>
          <h2 className="text-lg font-medium text-slate-900 tracking-tight">Monthly Client Attendance & Trips</h2>
          <p className="text-xs text-slate-500 mt-0.5">Switch between months and years to track dynamic schedules.</p>
        </div>

        {/* Dynamic Selectors */}
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

      {/* Dynamic Calendar Grid Table */}
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
                  </td>
                  {daysArray.map((day) => {
                    const record = client.attendance.find((a) => a.day === day);
                    const status = record?.status;

                    let bgClass = 'bg-slate-100 hover:bg-slate-200 text-transparent';
                    if (status === 'completed') bgClass = 'bg-cyan-500 text-white font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]';
                    if (status === 'cancelled') bgClass = 'bg-rose-500 text-white font-bold';

                    return (
                      <td key={day} className="p-1 text-center">
                        <button
                          onClick={() => handleToggleAttendance(client.id, day, status)}
                          className={`w-7 h-7 rounded-lg text-[10px] transition flex items-center justify-center mx-auto ${bgClass}`}
                          title={`Day ${day}: ${status || 'No record'}`}
                        >
                          {status === 'completed' ? '✓' : status === 'cancelled' ? '✕' : '•'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-sky-100 w-full max-w-md p-8 rounded-3xl shadow-2xl">
            <h3 className="text-base font-medium text-slate-900 mb-4">Add New Monthly Client</h3>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Route / Destination</label>
                <input
                  type="text"
                  required
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value)}
                  placeholder="e.g. Marina to DIFC"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Vehicle</label>
                  <input
                    type="text"
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Monthly Fee (AED)</label>
                  <input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-3 rounded-xl transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white font-medium text-xs py-3 rounded-xl transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}