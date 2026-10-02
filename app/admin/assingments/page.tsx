'use client';

import { useEffect, useState, useCallback } from 'react';

interface Assignment {
  id: string;
  driverName: string;
  vehicleNumber: string;
  assignedDate: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [driverName, setDriverName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('Toyota Camry');
  const [assignedDate, setAssignedDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = useCallback(() => {
    try {
      const local = localStorage.getItem('lumina_assignments');
      if (local) {
        setAssignments(JSON.parse(local));
      }
    } catch {
      setError('Failed to load local assignment records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const newEntry: Assignment = {
      id: Date.now().toString(),
      driverName,
      vehicleNumber,
      assignedDate: new Date(assignedDate).toISOString(),
    };

    try {
      const updated = [newEntry, ...assignments];
      setAssignments(updated);
      localStorage.setItem('lumina_assignments', JSON.stringify(updated));
      setDriverName('');
      setAssignedDate('');
    } catch {
      setError('Failed to save assignment record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 text-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.25)] border border-cyan-300/40">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[70px] pointer-events-none" />
        <div className="relative z-10">
          <span className="bg-white/20 border border-white/30 text-white text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-[0.15em] backdrop-blur-md">
            Operations Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-light mt-3 tracking-tight text-white">Vehicle Shift Assignments</h2>
          <p className="text-sky-100 text-xs mt-1 max-w-sm font-light leading-relaxed opacity-90">
            Assign drivers to fleet vehicles by date for accountability under Lumina 1.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-medium backdrop-blur-xl">
          {error}
        </div>
      )}

      {/* New Assignment Form */}
      <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-6 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)]">
        <h3 className="text-xs font-medium text-slate-500 mb-4 tracking-[0.15em] uppercase">New Shift Assignment</h3>
        <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Driver Name</label>
            <input
              type="text"
              required
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g. Ahmed Khan"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Vehicle</label>
            <select
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            >
              <option value="Toyota Corolla">Toyota Corolla</option>
              <option value="Toyota Camry">Toyota Camry</option>
              <option value="Kia Carnival">Kia Carnival</option>
              <option value="Nissan Patrol">Nissan Patrol</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Shift Date</label>
            <input
              type="date"
              required
              value={assignedDate}
              onChange={(e) => setAssignedDate(e.target.value)}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
            >
              {submitting ? 'Saving...' : '+ Assign Driver'}
            </button>
          </div>
        </form>
      </div>

      {/* Assignments Table */}
      <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)] overflow-hidden">
        <div className="p-5 border-b border-sky-100 flex justify-between items-center">
          <h3 className="text-xs font-medium text-slate-600 tracking-[0.1em] uppercase">Active Shift Logs</h3>
          <span className="text-[11px] text-cyan-700 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-200 font-medium">
            {assignments.length} Shifts
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-light tracking-widest">
            LOADING SHIFT DATA...
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-light">
            No shift assignments recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sky-100 text-slate-500 font-medium tracking-[0.05em]">
                  <th className="p-4">Driver</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Assigned Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100/60">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-white/60 transition">
                    <td className="p-4 font-normal text-slate-900">{a.driverName}</td>
                    <td className="p-4 text-cyan-700 font-medium">{a.vehicleNumber}</td>
                    <td className="p-4 text-slate-600">
                      {new Date(a.assignedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}