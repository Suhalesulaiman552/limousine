'use client';

import { useEffect, useState } from 'react';

interface Booking {
  id: string;
  clientName: string;
  driverName?: string;
  pickupLocation: string;
  dropoffLocation: string;
  bookingDate: string;
  status: string;
  vehicle: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state for creating a new booking
  const [clientName, setClientName] = useState('');
  const [driverName, setDriverName] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [vehicle, setVehicle] = useState('Toyota Camry');
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setError('Failed to load bookings.');
      }
    } catch {
      setError('Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          driverName: driverName || 'Unassigned',
          pickupLocation,
          dropoffLocation,
          bookingDate: new Date(bookingDate).toISOString(),
          vehicle,
          status: 'SCHEDULED'
        })
      });

      if (res.ok) {
        setClientName('');
        setDriverName('');
        setPickupLocation('');
        setDropoffLocation('');
        setBookingDate('');
        fetchBookings();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create booking.');
      }
    } catch {
      setError('Network error while saving booking.');
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
            Dispatch Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-light mt-3 tracking-tight text-white">Client Bookings</h2>
          <p className="text-sky-100 text-xs mt-1 max-w-sm font-light leading-relaxed opacity-90">
            Schedule rides, assign drivers, and manage dispatches across the fleet.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-medium backdrop-blur-xl">
          {error}
        </div>
      )}

      {/* New Booking Form (Lumina 1 Glass) */}
      <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-6 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)]">
        <h3 className="text-xs font-medium text-slate-500 mb-4 tracking-[0.15em] uppercase">Schedule New Ride</h3>
        <form onSubmit={handleCreateBooking} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Client Name</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Sheikh Mohammed"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Assigned Driver</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g. Ahmed"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Assigned Vehicle</label>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            >
              <option value="Toyota Corolla">Toyota Corolla</option>
              <option value="Toyota Camry">Toyota Camry</option>
              <option value="Kia Carnival">Kia Carnival</option>
              <option value="Nissan Patrol">Nissan Patrol</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Pickup Location</label>
            <input
              type="text"
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g. Berlin Airport BER"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Dropoff Location</label>
            <input
              type="text"
              required
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              placeholder="e.g. Adlon Kempinski Berlin"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">Date & Time</label>
            <input
              type="datetime-local"
              required
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
            >
              {submitting ? 'Saving...' : '+ Add Booking'}
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)] overflow-hidden">
        <div className="p-5 border-b border-sky-100 flex justify-between items-center">
          <h3 className="text-xs font-medium text-slate-600 tracking-[0.1em] uppercase">Active Dispatches</h3>
          <span className="text-[11px] text-cyan-700 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-200 font-medium">
            {bookings.length} Records
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-light tracking-widest">
            LOADING DISPATCH DATA...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-light">
            No active bookings found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sky-100 text-slate-500 font-medium tracking-[0.05em]">
                  <th className="p-4">Client</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Date / Time</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/60 transition">
                    <td className="p-4 font-normal text-slate-900">{b.clientName}</td>
                    <td className="p-4 font-medium text-cyan-700">{b.driverName || 'Unassigned'}</td>
                    <td className="p-4 text-slate-700">{b.vehicle}</td>
                    <td className="p-4 text-slate-600">
                      <span className="block">{b.pickupLocation}</span>
                      <span className="text-[10px] text-slate-400">➔ {b.dropoffLocation}</span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(b.bookingDate).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="bg-cyan-500/10 text-cyan-800 px-2.5 py-1 rounded-md border border-cyan-200 text-[10px] font-medium uppercase tracking-wide">
                        {b.status}
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