'use client';

import { useState, useEffect } from 'react';

interface AttendanceRecord {
  day: number;
  status: boolean;
}

interface ClientTrip {
  id: string;
  name: string;
  route: string;
  type: string;
  vehicle: string;
  monthlyFee: number;
  attendance: AttendanceRecord[];
}

export default function MonthlyTripsPage() {
  const [clients, setClients] = useState<ClientTrip[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // New client form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRoute, setNewRoute] = useState('');
  const [newType, setNewType] = useState('Work');
  const [newVehicle, setNewVehicle] = useState('Toyota Camry');
  const [newFee, setNewFee] = useState('1200');

  const currentMonthKey = '2026-10'; // Current active billing month
  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const fetchClients = async () => {
    try {
      const res = await fetch(`/api/monthly?monthKey=${currentMonthKey}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
        if (data.length > 0 && (!selectedClientId || !data.some(c => c.id === selectedClientId))) {
          setSelectedClientId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const activeClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const toggleAttendance = async (day: number) => {
    if (!activeClient) return;

    // Find current status for this day
    const existing = activeClient.attendance.find(a => a.day === day);
    let nextStatus: boolean | null = true;

    if (existing) {
      if (existing.status === true) nextStatus = false; // Went -> Skipped
      else if (existing.status === false) nextStatus = null; // Skipped -> Clear
    } else {
      nextStatus = true; // Unmarked -> Went
    }

    // Optimistic UI update
    setClients(prev =>
      prev.map(c => {
        if (c.id === activeClient.id) {
          let updatedAttendance = [...c.attendance.filter(a => a.day !== day)];
          if (nextStatus !== null) {
            updatedAttendance.push({ day, status: nextStatus });
          }
          return { ...c, attendance: updatedAttendance };
        }
        return c;
      })
    );

    // Sync to Neon DB via API
    await fetch('/api/monthly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'attendance',
        clientId: activeClient.id,
        monthKey: currentMonthKey,
        day,
        status: nextStatus,
      }),
    });
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRoute) return;

    const res = await fetch('/api/monthly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        name: newName,
        route: newRoute,
        type: newType,
        vehicle: newVehicle,
        monthlyFee: parseFloat(newFee),
      }),
    });

    if (res.ok) {
      setNewName('');
      setNewRoute('');
      setShowAddModal(false);
      fetchClients();
    }
  };

  // Calculations for active client
  const daysWent = activeClient?.attendance.filter(a => a.status === true).length || 0;
  const daysOff = activeClient?.attendance.filter(a => a.status === false).length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-cyan-600 text-xs font-light tracking-widest uppercase">
        Loading Monthly Operations...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Lumina 1 Master Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 text-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.25)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-cyan-300/40">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[70px] pointer-events-none" />
        
        <div className="relative z-10">
          <span className="bg-white/20 border border-white/30 text-white text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-[0.15em] backdrop-blur-md">
            Cloud Synchronized Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-light mt-3 tracking-tight text-white">Monthly Client Tracker</h2>
          <p className="text-sky-100 text-xs mt-1 max-w-md font-light leading-relaxed opacity-90">
            Real-time multi-device attendance logs for work and university commuters. Saved securely in Neon DB.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="relative z-10 w-full sm:w-auto text-center bg-white hover:bg-sky-50 text-slate-900 text-xs font-medium px-5 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.02]"
        >
          + Add Regular Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-xl border border-sky-200 p-12 rounded-2xl text-center">
          <p className="text-slate-600 text-sm mb-4">No regular monthly clients added yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md"
          >
            Add Your First Client (e.g. Aysha, Maryam)
          </button>
        </div>
      ) : (
        <>
          {/* Client Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {clients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`px-5 py-3 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-3 whitespace-nowrap backdrop-blur-xl border ${
                  activeClient?.id === client.id
                    ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] font-semibold'
                    : 'bg-white/60 text-slate-700 border-sky-200 hover:bg-white hover:border-cyan-400'
                }`}
              >
                <span>{client.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeClient?.id === client.id ? 'bg-slate-950/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {client.type}
                </span>
              </button>
            ))}
          </div>

          {activeClient && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)]">
                  <span className="text-slate-500 text-[10px] tracking-widest uppercase font-medium">Route & Vehicle</span>
                  <h3 className="text-lg font-medium text-slate-900 mt-2">{activeClient.route}</h3>
                  <p className="text-cyan-600 text-xs font-medium mt-1">Assigned: {activeClient.vehicle}</p>
                </div>

                <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)]">
                  <span className="text-slate-500 text-[10px] tracking-widest uppercase font-medium">Monthly Attendance Tally</span>
                  <div className="flex items-baseline gap-4 mt-2">
                    <div>
                      <span className="text-2xl font-light text-emerald-600">{daysWent}</span>
                      <span className="text-xs text-slate-500 ml-1">Days Went</span>
                    </div>
                    <div>
                      <span className="text-2xl font-light text-rose-600">{daysOff}</span>
                      <span className="text-xs text-slate-500 ml-1">Days Off</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)]">
                  <span className="text-slate-500 text-[10px] tracking-widest uppercase font-medium">Estimated Monthly Billing</span>
                  <p className="text-2xl font-light text-slate-900 mt-2">AED {activeClient.monthlyFee}</p>
                  <span className="text-[10px] text-cyan-600 font-medium">Fixed Contract Rate</span>
                </div>
              </div>

              {/* Calendar Grid View */}
              <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-6 rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                  <div>
                    <h3 className="text-base font-medium text-slate-900">Attendance Calendar ({activeClient.name})</h3>
                    <p className="text-slate-500 text-xs">Tap any day cell to toggle: <span className="text-emerald-600 font-medium">Went</span> → <span className="text-rose-600 font-medium">Skipped</span> → <span className="text-slate-500 font-medium">Clear</span></p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500"></span> Went</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500"></span> Skipped</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-slate-300"></span> Unmarked</span>
                  </div>
                </div>

                <div className="grid grid-cols-7 sm:grid-cols-10 gap-2.5">
                  {currentMonthDays.map(day => {
                    const record = activeClient.attendance.find(a => a.day === day);
                    let bgClass = "bg-white/60 border-slate-200 text-slate-700 hover:border-cyan-400";
                    let statusText = "—";

                    if (record?.status === true) {
                      bgClass = "bg-emerald-500/15 border-emerald-500 text-emerald-800 shadow-sm";
                      statusText = "Went";
                    } else if (record?.status === false) {
                      bgClass = "bg-rose-500/15 border-rose-500 text-rose-800 shadow-sm";
                      statusText = "Off";
                    }

                    return (
                      <button
                        key={day}
                        onClick={() => toggleAttendance(day)}
                        className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-20 ${bgClass}`}
                      >
                        <span className="text-xs font-semibold">Day {day}</span>
                        <span className="text-[11px] font-medium tracking-wide">{statusText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-sky-200 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Add Regular Monthly Client</h3>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aysha or Maryam"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:border-cyan-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Route (From → To)</label>
                <input
                  type="text"
                  placeholder="e.g. Dibba to Fujairah Work"
                  value={newRoute}
                  onChange={e => setNewRoute(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:border-cyan-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm focus:border-cyan-500 outline-none"
                  >
                    <option value="Work">Work</option>
                    <option value="University">University</option>
                    <option value="School">School</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Monthly Fee (AED)</label>
                  <input
                    type="number"
                    value={newFee}
                    onChange={e => setNewFee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm focus:border-cyan-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Assigned Vehicle</label>
                <select
                  value={newVehicle}
                  onChange={e => setNewVehicle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:border-cyan-500 outline-none"
                >
                  <option value="Toyota Camry">Toyota Camry</option>
                  <option value="Toyota Corolla">Toyota Corolla</option>
                  <option value="Kia Carnival">Kia Carnival</option>
                  <option value="Nissan Patrol">Nissan Patrol</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2.5 rounded-xl text-xs font-semibold transition shadow-md"
                >
                  Save to Cloud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}