
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
  price: number | string;
}

interface FleetVehicle {
  id: string;
  name: string;
  registrationNumber: string;
  status: string;
}

interface FleetDriver {
  id: string;
  name: string;
  status: string;
}

const inputClass =
  'w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition';

function toLocalDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [fleetDrivers, setFleetDrivers] = useState<FleetDriver[]>([]);
  const [unavailableVehicles, setUnavailableVehicles] = useState<string[]>([]);
  const [unavailableDrivers, setUnavailableDrivers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [clientName, setClientName] = useState('');
  const [driverName, setDriverName] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('SCHEDULED');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();

      if (Array.isArray(data)) {
        setBookings(data);
        setError('');
      } else {
        setError(data.error || 'Failed to load bookings.');
      }
    } catch {
      setError('Error connecting to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    const fetchVehicles = async () => {
      try {
        const res = await fetch('/api/fleet');
        const data = await res.json();

        if (res.ok && Array.isArray(data.vehicles)) {
          setFleetVehicles(data.vehicles);
        }

        if (res.ok && Array.isArray(data.drivers)) {
          setFleetDrivers(data.drivers);
        }
      } catch {
        console.error('Failed to load fleet vehicles.');
      }
    };

    fetchVehicles();
  }, []);

  // Check vehicle and driver availability for selected date/time
  useEffect(() => {
    if (!bookingDate) {
      setUnavailableVehicles([]);
      setUnavailableDrivers([]);
      return;
    }

    const controller = new AbortController();

    const checkAvailability = async () => {
      try {
        const params = new URLSearchParams({
          availabilityDate: new Date(bookingDate).toISOString(),
        });

        if (editingId) {
          params.set('excludeId', editingId);
        }

        const res = await fetch(`/api/bookings?${params.toString()}`, {
          signal: controller.signal,
        });

        const data = await res.json();

        if (res.ok) {
          setUnavailableVehicles(data.unavailableVehicles || []);
          setUnavailableDrivers(data.unavailableDrivers || []);

          // Clear selected resources if they are unavailable
          if (
            data.unavailableVehicles?.includes(vehicle)
          ) {
            setVehicle('');
          }

          if (
            data.unavailableDrivers?.includes(driverName)
          ) {
            setDriverName('');
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Failed to check booking availability.');
        }
      }
    };

    checkAvailability();

    return () => controller.abort();
  }, [bookingDate, editingId]);

  const resetForm = () => {
    setClientName('');
    setDriverName('');
    setPickupLocation('');
    setDropoffLocation('');
    setBookingDate('');
    setVehicle('');
    setPrice('');
    setStatus('SCHEDULED');
    setEditingId(null);
    setUnavailableVehicles([]);
    setUnavailableDrivers([]);
  };

  const handleEdit = (booking: Booking) => {
    setEditingId(booking.id);
    setClientName(booking.clientName);
    setDriverName(booking.driverName || '');
    setPickupLocation(booking.pickupLocation);
    setDropoffLocation(booking.dropoffLocation);
    setBookingDate(toLocalDateTime(booking.bookingDate));
    setVehicle(booking.vehicle);
    setPrice(String(booking.price));
    setStatus(booking.status);
    setError('');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const isEditing = editingId !== null;

      const payload = {
        ...(isEditing ? { id: editingId } : {}),
        clientName,
        driverName,
        pickupLocation,
        dropoffLocation,
        bookingDate: new Date(bookingDate).toISOString(),
        vehicle,
        price: Number(price),
        status,
      };

      const res = await fetch('/api/bookings', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        resetForm();
        await fetchBookings();
      } else {
        setError(data.error || 'Failed to save booking.');
      }
    } catch {
      setError('Network error while saving booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    const confirmed = window.confirm(
      `Cancel the booking for ${booking.clientName}?\n\nThis booking will remain in your records.`
    );

    if (!confirmed) return;

    setCancellingId(booking.id);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booking.id,
          clientName: booking.clientName,
          driverName: booking.driverName || '',
          pickupLocation: booking.pickupLocation,
          dropoffLocation: booking.dropoffLocation,
          bookingDate: booking.bookingDate,
          vehicle: booking.vehicle,
          price: Number(booking.price),
          status: 'CANCELLED',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to cancel booking.');
        return;
      }

      if (editingId === booking.id) {
        resetForm();
      }

      await fetchBookings();
    } catch {
      setError('Network error while cancelling booking.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 text-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(6,182,199,0.25)] border border-cyan-300/40">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[70px] pointer-events-none" />
        <div className="relative z-10">
          <span className="bg-white/20 border border-white/30 text-white text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-[0.15em] backdrop-blur-md">
            Dispatch Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-light mt-3 tracking-tight text-white">
            Client Bookings
          </h2>
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

      {/* Booking Form */}
      <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-6 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)]">
        <h3 className="text-xs font-medium text-slate-500 mb-4 tracking-[0.15em] uppercase">
          {editingId ? 'Edit Booking' : 'Schedule New Ride'}
        </h3>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Client Name
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Sheikh Mohammed"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Assigned Driver
            </label>
            <select
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className={inputClass}
            >
              <option value="">Select Driver</option>

              {fleetDrivers
                .filter((d) => d.status === 'ACTIVE')
                .map((d) => {
                  const unavailable = unavailableDrivers.includes(d.name);

                  return (
                    <option
                      key={d.id}
                      value={d.name}
                      disabled={unavailable}
                    >
                      {d.name} — {unavailable ? 'Unavailable' : 'Available'}
                    </option>
                  );
                })}

              {editingId &&
                driverName &&
                !fleetDrivers.some((d) => d.name === driverName) && (
                  <option value={driverName}>{driverName}</option>
                )}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Assigned Vehicle
            </label>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select Vehicle</option>

              {fleetVehicles
                .filter((v) => v.status === 'AVAILABLE')
                .map((v) => {
                  const unavailable = unavailableVehicles.includes(v.name);

                  return (
                    <option
                      key={v.id}
                      value={v.name}
                      disabled={unavailable}
                    >
                      {v.name} — {v.registrationNumber}
                      {unavailable ? ' — Unavailable' : ' — Available'}
                    </option>
                  );
                })}

              {editingId &&
                vehicle &&
                !fleetVehicles.some((v) => v.name === vehicle) && (
                  <option value={vehicle}>{vehicle}</option>
                )}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Pickup Location
            </label>
            <input
              type="text"
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g. Dubai Airport"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Dropoff Location
            </label>
            <input
              type="text"
              required
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              placeholder="e.g. Dubai Marina"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Price (AED)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 250"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Booking Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-6 py-2.5 rounded-xl transition disabled:opacity-50"
              >
                Cancel Edit
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
            >
              {submitting
                ? 'Saving...'
                : editingId
                  ? 'Save Changes'
                  : '+ Add Booking'}
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)] overflow-hidden">
        <div className="p-5 border-b border-sky-100 flex justify-between items-center">
          <h3 className="text-xs font-medium text-slate-600 tracking-[0.1em] uppercase">
            Active Dispatches
          </h3>
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
                  <th className="p-4">Price (AED)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sky-100/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/60 transition">
                    <td className="p-4 font-normal text-slate-900">
                      {b.clientName}
                    </td>
                    <td className="p-4 font-medium text-cyan-700">
                      {b.driverName || 'Unassigned'}
                    </td>
                    <td className="p-4 text-slate-700">{b.vehicle}</td>
                    <td className="p-4 text-slate-600">
                      <span className="block">{b.pickupLocation}</span>
                      <span className="text-[10px] text-slate-400">
                        ➔ {b.dropoffLocation}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(b.bookingDate).toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-700 font-medium">
                      {Number(b.price).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-md border text-[10px] font-medium uppercase tracking-wide ${
                          b.status === 'CANCELLED'
                            ? 'bg-rose-500/10 text-rose-800 border-rose-200'
                            : b.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-800 border-emerald-200'
                              : 'bg-cyan-500/10 text-cyan-800 border-cyan-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {b.status !== 'CANCELLED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEdit(b)}
                              className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-lg text-[10px] font-medium transition"
                            >
                              Edit
                            </button>
                            {(b.status === 'SCHEDULED' ||
                              b.status === 'CONFIRMED') && (
                              <button
                                type="button"
                                onClick={() => handleCancelBooking(b)}
                                disabled={cancellingId === b.id}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-[10px] font-medium transition disabled:opacity-50"
                              >
                                {cancellingId === b.id
                                  ? 'Cancelling...'
                                  : 'Cancel'}
                              </button>
                            )}
                          </>
                        )}
                        {b.status === 'CANCELLED' && (
                          <span className="text-[10px] text-slate-400">
                            No actions
                          </span>
                        )}
                      </div>
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
