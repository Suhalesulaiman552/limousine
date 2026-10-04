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
  const [loading, setLoading] = useState(true);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // New client form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRoute, setNewRoute] = useState('');
  const [newType, setNewType] = useState('Work');
  const [newVehicle, setNewVehicle] = useState('Toyota Camry');
  const [newFee, setNewFee] = useState('1200');

  const currentMonthKey = '2026-10';
  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const fetchClients = async () => {
    try {
      const res = await fetch(`/api/monthly?monthKey=${currentMonthKey}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
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

  const toggleClientCard = (clientId: string) => {
    setExpandedClientId(prev => (prev === clientId ? null : clientId));
  };

  const toggleAttendance = async (clientId: string, day: number) => {
    const targetClient = clients.find(c => c.id === clientId);
    if (!targetClient) return;

    const existing = targetClient.attendance.find(a => a.day === day);
    let nextStatus: boolean | null = true;

    if (existing) {
      if (existing.status === true) nextStatus = false;
      else if (existing.status === false) nextStatus = null;
    } else {
      nextStatus = true;
    }

    // Optimistic UI update
    setClients(prev =>
      prev.map(c => {
        if (c.id === clientId) {
          let updatedAttendance = [...c.attendance.filter(a => a.day !== day)];
          if (nextStatus !== null) {
            updatedAttendance.push({ day, status: nextStatus });
          }
          return { ...c, attendance: updatedAttendance };
        }
        return c;
      })
    );

    // Sync to database
    await fetch('/api/monthly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'attendance',
        clientId,
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
            Recurring Operations
          </span>
          <h2 className="text-xl sm:text-2xl font-light mt-3 tracking-tight text-white">Monthly Client Directory</h2>
          <p className="text-sky-100 text-xs mt-1 max-w-md font-light leading-relaxed opacity-90">
            Click any client card below to toggle their attendance calendar and view monthly billing metrics.
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
        <div className="bg-white/50 backdrop-blur-xl border border-sky-200 p-12 rounded-2xl text-center shadow-sm">
          <p className="text-slate-600 text-sm mb-4">No regular monthly clients added yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md"
          >
            Add Your First Client (e.g. Aysha, Maryam)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {clients.map(client => {
            const isExpanded = expandedClientId === client.id;
            const daysWent = client.attendance.filter(a => a.status === true).length;
            const daysOff = client.attendance.filter(a => a.status === false).length;

            return (
              <div
                key={client.id}
                className={`group relative bg-white/70 backdrop-blur-2xl rounded-2xl border transition-all duration-300 overflow-hidden shadow-[0_4px_25px_0_rgba(2,132,199,0.06)] ${
                  isExpanded ? 'border-cyan-400 ring-2 ring-cyan-400/20 shadow-[0_8px_30px_rgba(6,182,212,0.12)]' : 'border-sky-200/90 hover:border-cyan-300'
                }`}
              >
                {/* Card Header / Main Row */}
                <div
                  onClick={() => toggleClientCard(client.id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Glowing Avatar Initials Indicator */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white flex items-center justify-center font-medium text-base shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base sm:text-lg font-normal text-slate-900 tracking-tight">{client.name}</h3>
                        <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                          client.type === 'University' 
                            ? 'bg-blue-500/10 text-blue-700 border-blue-200' 
                            : 'bg-cyan-500/10 text-cyan-700 border-cyan-200'
                        }`}>
                          {client.type}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs font-light">
                        Route: <span className="text-slate-800 font-medium">{client.route}</span> • Fleet: <span className="text-cyan-600 font-medium">{client.vehicle}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-sky-100">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200">{daysWent} Went</span>
                        <span className="text-rose-600 font-medium bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-200">{daysOff} Off</span>
                      </div>
                      <p className="text-slate-900 text-sm font-light mt-1">Fee: <strong className="font-semibold text-slate-900">AED {client.monthlyFee}</strong></p>
                    </div>

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs transition-all duration-300 ${
                      isExpanded 
                        ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] rotate-180' 
                        : 'bg-sky-100/80 text-cyan-700 group-hover:bg-cyan-500 group-hover:text-white'
                    }`}>
                      ▼
                    </div>
                  </div>
                </div>

                {/* Collapsible Attendance Calendar Section */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-sky-100 bg-gradient-to-b from-sky-50/40 to-white/60 space-y-4 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2">
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-cyan-800">Attendance Calendar</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Tap any day cell to toggle: <span className="text-emerald-600 font-medium">Went</span> → <span className="text-rose-600 font-medium">Skipped</span> → <span className="text-slate-500 font-medium">Clear</span></p>
                      </div>
                      <div className="flex items-center gap-3 text-xs bg-white/80 px-3 py-1.5 rounded-xl border border-sky-200/60 shadow-sm">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Went</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Skipped</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Unmarked</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                      {currentMonthDays.map(day => {
                        const record = client.attendance.find(a => a.day === day);
                        let bgClass = "bg-white/80 border-slate-200 text-slate-700 hover:border-cyan-400 hover:bg-white";
                        let statusText = "—";

                        if (record?.status === true) {
                          bgClass = "bg-emerald-500/15 border-emerald-500 text-emerald-900 shadow-sm font-medium";
                          statusText = "Went";
                        } else if (record?.status === false) {
                          bgClass = "bg-rose-500/15 border-rose-500 text-rose-900 shadow-sm font-medium";
                          statusText = "Off";
                        }

                        return (
                          <button
                            key={day}
                            onClick={() => toggleAttendance(client.id, day)}
                            className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-18 ${bgClass}`}
                          >
                            <span className="text-[11px] font-semibold opacity-80">Day {day}</span>
                            <span className="text-[10px] tracking-wide">{statusText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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