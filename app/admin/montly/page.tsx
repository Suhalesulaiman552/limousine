'use client';

import { useState } from 'react';

// Mock/Initial data representing your regular monthly clients
interface ClientTrip {
  id: string;
  name: string;
  route: string;
  type: 'Work' | 'University';
  vehicle: string;
  monthlyFee: number;
  // Track days of the current month (e.g., Day 1 to 31)
  attendance: Record<number, boolean | null>; // true = went, false = skipped, null = pending
}

export default function MonthlyTripsPage() {
  const [clients, setClients] = useState<ClientTrip[]>([
    {
      id: '1',
      name: 'Aysha',
      route: 'Dibba to Fujairah',
      type: 'Work',
      vehicle: 'Toyota Camry',
      monthlyFee: 1200,
      attendance: { 1: true, 2: true, 3: false, 4: true, 5: true },
    },
    {
      id: '2',
      name: 'Maryam',
      route: 'Dibba to Sharjah University',
      type: 'University',
      vehicle: 'Nissan Patrol',
      monthlyFee: 1800,
      attendance: { 1: true, 2: false, 3: true, 4: true, 5: true },
    },
  ]);

  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0].id);
  const [newClientName, setNewClientName] = useState('');
  const [newRoute, setNewRoute] = useState('');
  const [newVehicle, setNewVehicle] = useState('Toyota Camry');
  const [showAddModal, setShowAddModal] = useState(false);

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Days in current month simulation (e.g., Oct 2026 has 31 days)
  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const toggleAttendance = (day: number) => {
    setClients(prev =>
      prev.map(client => {
        if (client.id === activeClient.id) {
          const currentStatus = client.attendance[day];
          // Cycle: undefined/null -> true (went) -> false (didnt go) -> null
          let nextStatus: boolean | null = true;
          if (currentStatus === true) nextStatus = false;
          else if (currentStatus === false) nextStatus = null;
          else nextStatus = true;

          return {
            ...client,
            attendance: { ...client.attendance, [day]: nextStatus },
          };
        }
        return client;
      })
    );
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newRoute) return;

    const newClient: ClientTrip = {
      id: Date.now().toString(),
      name: newClientName,
      route: newRoute,
      type: 'Work',
      vehicle: newVehicle,
      monthlyFee: 1500,
      attendance: {},
    };

    setClients([...clients, newClient]);
    setNewClientName('');
    setNewRoute('');
    setShowAddModal(false);
  };

  // Calculate totals for active client
  const daysAttended = Object.values(activeClient.attendance).filter(v => v === true).length;
  const daysMissed = Object.values(activeClient.attendance).filter(v => v === false).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Lumina 1 Master Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 text-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.25)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-cyan-300/40">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[70px] pointer-events-none" />
        
        <div className="relative z-10">
          <span className="bg-white/20 border border-white/30 text-white text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-[0.15em] backdrop-blur-md">
            Recurring Operations
          </span>
          <h2 className="text-xl sm:text-2xl font-light mt-3 tracking-tight text-white">Monthly Client Tracker</h2>
          <p className="text-sky-100 text-xs mt-1 max-w-md font-light leading-relaxed opacity-90">
            Monitor daily school, university, and work commutes. Track attendance calendars and active monthly schedules.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="relative z-10 w-full sm:w-auto text-center bg-white hover:bg-sky-50 text-slate-900 text-xs font-medium px-5 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.02]"
        >
          + Add Regular Client
        </button>
      </div>

      {/* Client Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {clients.map(client => (
          <button
            key={client.id}
            onClick={() => setSelectedClientId(client.id)}
            className={`px-5 py-3 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-3 whitespace-nowrap backdrop-blur-xl border ${
              activeClient.id === client.id
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] font-semibold'
                : 'bg-white/5 text-slate-300 border-sky-500/20 hover:bg-white/10 hover:border-cyan-500/40'
            }`}
          >
            <span>{client.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeClient.id === client.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              {client.type}
            </span>
          </button>
        ))}
      </div>

      {/* Active Client Summary & Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-sky-500/20 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)]">
          <span className="text-slate-400 text-[10px] tracking-widest uppercase font-medium">Route & Vehicle</span>
          <h3 className="text-lg font-medium text-white mt-2">{activeClient.route}</h3>
          <p className="text-cyan-400 text-xs font-light mt-1">Assigned: {activeClient.vehicle}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-sky-500/20 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)]">
          <span className="text-slate-400 text-[10px] tracking-widest uppercase font-medium">Monthly Attendance Tally</span>
          <div className="flex items-baseline gap-4 mt-2">
            <div>
              <span className="text-2xl font-light text-emerald-400">{daysAttended}</span>
              <span className="text-xs text-slate-400 ml-1">Days Went</span>
            </div>
            <div>
              <span className="text-2xl font-light text-rose-400">{daysMissed}</span>
              <span className="text-xs text-slate-400 ml-1">Days Off</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-sky-500/20 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)]">
          <span className="text-slate-400 text-[10px] tracking-widest uppercase font-medium">Estimated Monthly Billing</span>
          <p className="text-2xl font-light text-white mt-2">AED {activeClient.monthlyFee}</p>
          <span className="text-[10px] text-cyan-400 font-medium">Fixed Contract Rate</span>
        </div>
      </div>

      {/* Calendar Grid View for Attendance */}
      <div className="bg-white/5 backdrop-blur-xl border border-sky-500/20 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <div>
            <h3 className="text-base font-medium text-white">Attendance Calendar ({activeClient.name})</h3>
            <p className="text-slate-400 text-xs">Tap any day cell to toggle: <span className="text-emerald-400 font-medium">Went</span> → <span className="text-rose-400 font-medium">Did not go</span> → <span className="text-slate-400 font-medium">Clear</span></p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500"></span> Went</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500"></span> Skipped</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span> Unmarked</span>
          </div>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-10 gap-2.5">
          {currentMonthDays.map(day => {
            const status = activeClient.attendance[day];
            let bgClass = "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500/40";
            let statusText = "—";

            if (status === true) {
              bgClass = "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
              statusText = "Went";
            } else if (status === false) {
              bgClass = "bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
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

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/30 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-medium text-white">Add Regular Monthly Client</h3>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aysha or Maryam"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Route (From → To)</label>
                <input
                  type="text"
                  placeholder="e.g. Dibba to Fujairah Work"
                  value={newRoute}
                  onChange={e => setNewRoute(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Vehicle</label>
                <select
                  value={newVehicle}
                  onChange={e => setNewVehicle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-cyan-500 outline-none"
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
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 py-2.5 rounded-xl text-xs font-semibold transition shadow-lg shadow-cyan-500/20"
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