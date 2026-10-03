'use client';

import { useEffect, useState } from 'react';

interface Fine {
  id: string;
  vehicleNumber: string;
  driverName: string;
  violation: string;
  amount: number;
  fineDate: string;
  paid: boolean;
}

interface Booking {
  id: string;
  vehicle: string;
  clientName: string;
  driverName?: string;
  date: string;
  time?: string;
}

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [vehicleNumber, setVehicleNumber] = useState('Toyota Camry');
  const [driverName, setDriverName] = useState('');
  const [violation, setViolation] = useState('');
  const [amount, setAmount] = useState('');
  const [fineDate, setFineDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [finesRes, bookingsRes] = await Promise.all([
        fetch('/api/fines').then(res => res.json()).catch(() => []),
        fetch('/api/bookings').then(res => res.json()).catch(() => []),
      ]);

      if (Array.isArray(finesRes)) setFines(finesRes);
      if (Array.isArray(bookingsRes)) setBookings(bookingsRes);
    } catch {
      setError('Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-detect driver when vehicle or fineDate changes
  useEffect(() => {
    if (!fineDate || !vehicleNumber || bookings.length === 0) return;
    
    const fineTime = new Date(fineDate).getTime();
    
    // Find a booking for this vehicle close to this timestamp (within same day)
    const matchedBooking = bookings.find(b => {
      if (b.vehicle !== vehicleNumber) return false;
      const bookingTime = new Date(b.date).getTime();
      // Match if it's on the same calendar day (within 24 hours)
      return Math.abs(fineTime - bookingTime) < 24 * 60 * 60 * 1000;
    });

    if (matchedBooking) {
      setDriverName(matchedBooking.driverName || matchedBooking.clientName || 'Assigned Driver');
    }
  }, [vehicleNumber, fineDate, bookings]);

  const handleCreateFine = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/fines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleNumber,
          driverName: driverName || 'Unassigned',
          violation,
          amount: parseFloat(amount),
          fineDate: new Date(fineDate).toISOString(),
          paid: false
        })
      });

      if (res.ok) {
        setViolation('');
        setAmount('');
        setFineDate('');
        setDriverName('');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to record fine.');
      }
    } catch {
      setError('Network error while saving fine.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalFinesAmount = fines.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(244,63,94,0.25)] border border-rose-300/40">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[70px] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-white/20 border border-white/30 text-white text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-[0.15em] backdrop-blur-md">
              Compliance Hub
            </span>
            <h2 className="text-xl sm:text-2xl font-light mt-3 tracking-tight text-white">Traffic Fines & Violations</h2>
            <p className="text-rose-100 text-xs mt-1 max-w-sm font-light leading-relaxed opacity-90">
              Track vehicle penalties, auto-detect responsible drivers, and monitor settlement statuses.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl text-right">
            <span className="text-[10px] uppercase tracking-[0.15em] text-rose-100 block">Total Penalties</span>
            <span className="text-xl font-medium text-white">AED {totalFinesAmount.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-medium backdrop-blur-xl">
          {error}
        </div>
      )}

      {/* New Fine Form (Lumina 1 Glass) */}
      <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-6 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)]">
        <h3 className="text-xs font-medium text-slate-500 mb-4 tracking-[0.15em] uppercase">Record New Violation & Identify Driver</h3>
        <form onSubmit={handleCreateFine} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Vehicle</label>
            <select
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-400 transition"
            >
              <option value="Toyota Corolla">Toyota Corolla</option>
              <option value="Toyota Camry">Toyota Camry</option>
              <option value="Kia Carnival">Kia Carnival</option>
              <option value="Nissan Patrol">Nissan Patrol</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Fine Date & Time</label>
            <input
              type="datetime-local"
              required
              value={fineDate}
              onChange={(e) => setFineDate(e.target.value)}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Responsible Driver</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Auto-detected or enter name"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Violation Description</label>
            <input
              type="text"
              required
              value={violation}
              onChange={(e) => setViolation(e.target.value)}
              placeholder="e.g. Speeding / Radar 120km/h"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Amount (AED)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 600"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-400 transition"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50"
            >
              {submitting ? 'Recording...' : '+ Add Violation & Match Driver'}
            </button>
          </div>
        </form>
      </div>

      {/* Fines Table / List */}
      <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)] overflow-hidden">
        <div className="p-5 border-b border-sky-100 flex justify-between items-center">
          <h3 className="text-xs font-medium text-slate-600 tracking-[0.1em] uppercase">Violation Logs & Driver Attribution</h3>
          <span className="text-[11px] text-rose-700 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-200 font-medium">
            {fines.length} Penalties
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-light tracking-widest">
            LOADING COMPLIANCE DATA...
          </div>
        ) : fines.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-light">
            No traffic fines recorded. Excellent driving record!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sky-100 text-slate-500 font-medium tracking-[0.05em]">
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Violation</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date / Time</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100/60">
                {fines.map((f) => (
                  <tr key={f.id} className="hover:bg-white/60 transition">
                    <td className="p-4 font-medium text-slate-900">{f.vehicleNumber}</td>
                    <td className="p-4 font-medium text-cyan-700">{f.driverName || 'Unassigned'}</td>
                    <td className="p-4 text-slate-700">{f.violation}</td>
                    <td className="p-4 font-medium text-rose-600">AED {f.amount.toFixed(2)}</td>
                    <td className="p-4 text-slate-600">
                      {new Date(f.fineDate).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md border text-[10px] font-medium uppercase tracking-wide ${
                        f.paid 
                          ? 'bg-emerald-500/10 text-emerald-800 border-emerald-200' 
                          : 'bg-rose-500/10 text-rose-800 border-rose-200'
                      }`}>
                        {f.paid ? 'Settled' : 'Unpaid'}
                      </span>
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