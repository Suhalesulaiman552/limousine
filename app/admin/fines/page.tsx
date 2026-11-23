
'use client';

import { useEffect, useMemo, useState } from 'react';

interface Fine {
  id: string;
  vehicleNumber: string;
  driverName: string;
  suggestedDriverName: string | null;
  driverConfirmed: boolean;
  location: string | null;
  violation: string;
  amount: number;
  fineDate: string;
  paid: boolean;
}

interface Booking {
  id: string;
  vehicle: string;
  clientName: string;
  driverName?: string | null;
  bookingDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
}

interface FleetVehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  registrationNumber: string;
  status: string;
}

interface FleetDriver {
  id: string;
  name: string;
  status: string;
}

const MATCH_WINDOW_HOURS = 8;

function toLocalDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [drivers, setDrivers] = useState<FleetDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [suggestedDriverName, setSuggestedDriverName] = useState('');
  const [driverConfirmed, setDriverConfirmed] = useState(false);
  const [location, setLocation] = useState('');
  const [violation, setViolation] = useState('');
  const [amount, setAmount] = useState('');
  const [fineDate, setFineDate] = useState('');
  const [paid, setPaid] = useState(false);

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.name === vehicleNumber
  );

  const fetchData = async () => {
    try {
      setError('');

      const [finesRes, bookingsRes, fleetRes] = await Promise.all([
        fetch('/api/fines'),
        fetch('/api/bookings'),
        fetch('/api/fleet'),
      ]);

      const [finesData, bookingsData, fleetData] = await Promise.all([
        finesRes.json(),
        bookingsRes.json(),
        fleetRes.json(),
      ]);

      if (!finesRes.ok || !bookingsRes.ok || !fleetRes.ok) {
        throw new Error('Failed to load fines, bookings, or fleet data.');
      }

      if (!Array.isArray(finesData)) {
        throw new Error(finesData.error || 'Failed to load fines.');
      }

      if (!Array.isArray(bookingsData)) {
        throw new Error(bookingsData.error || 'Failed to load bookings.');
      }

      if (!fleetData || !Array.isArray(fleetData.vehicles)) {
        throw new Error('Failed to load fleet vehicles.');
      }

      setFines(finesData);
      setBookings(bookingsData);
      setVehicles(fleetData.vehicles);
      setDrivers(Array.isArray(fleetData.drivers) ? fleetData.drivers : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error connecting to database.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Find the most recent non-cancelled booking for this vehicle
  // before the fine time, within the previous 8 hours.
  const matchedBooking = useMemo(() => {
    if (!fineDate || !vehicleNumber || editingId) return null;

    const fineTime = new Date(fineDate).getTime();

    if (Number.isNaN(fineTime)) return null;

    const possibleMatches = bookings.filter((booking) => {
      if (booking.status === 'CANCELLED') return false;

      const bookingTime = new Date(booking.bookingDate).getTime();

      if (Number.isNaN(bookingTime)) return false;

      const difference = fineTime - bookingTime;

      const bookingVehicle = booking.vehicle.trim().toLowerCase();

      const matchesVehicle = [
        vehicleNumber,
        selectedVehicle?.registrationNumber,
      ]
        .filter(Boolean)
        .some((value) => bookingVehicle === value!.trim().toLowerCase());

      return (
        matchesVehicle &&
        difference >= 0 &&
        difference <= MATCH_WINDOW_HOURS * 60 * 60 * 1000
      );
    });

    possibleMatches.sort(
      (a, b) =>
        new Date(b.bookingDate).getTime() -
        new Date(a.bookingDate).getTime()
    );

    return possibleMatches[0] || null;
  }, [fineDate, vehicleNumber, bookings, editingId, selectedVehicle]);

  // Automatically suggest a driver when recording a new fine.
  useEffect(() => {
    if (editingId) return;

    const suggested = matchedBooking?.driverName?.trim() || '';

    setSuggestedDriverName(suggested);
    setDriverName(suggested);
    setDriverConfirmed(false);
  }, [matchedBooking, editingId]);

  const resetForm = () => {
    setEditingId(null);
    setVehicleNumber('');
    setDriverName('');
    setSuggestedDriverName('');
    setDriverConfirmed(false);
    setLocation('');
    setViolation('');
    setAmount('');
    setFineDate('');
    setPaid(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!driverConfirmed) {
      setError('Please verify and confirm the driver attribution.');
      return;
    }

    if (!vehicleNumber || !fineDate) {
      setError('Please select a vehicle and fine date.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        vehicleNumber,
        driverName: driverName.trim() || 'Unassigned',
        suggestedDriverName: suggestedDriverName || null,
        driverConfirmed,
        location,
        violation,
        amount: Number(amount),
        fineDate: new Date(fineDate).toISOString(),
        paid,
      };

      const res = await fetch('/api/fines', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save fine.');
      }

      resetForm();
      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Network error while saving fine.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (fine: Fine) => {
    setEditingId(fine.id);
    setVehicleNumber(fine.vehicleNumber);
    setDriverName(fine.driverName || '');
    setSuggestedDriverName(fine.suggestedDriverName || '');
    setDriverConfirmed(fine.driverConfirmed);
    setLocation(fine.location || '');
    setViolation(fine.violation);
    setAmount(String(fine.amount));
    setFineDate(toLocalDateTime(fine.fineDate));
    setPaid(fine.paid);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePaid = async (fine: Fine) => {
    setError('');

    try {
      const res = await fetch('/api/fines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: fine.id,
          vehicleNumber: fine.vehicleNumber,
          driverName: fine.driverName,
          suggestedDriverName: fine.suggestedDriverName,
          driverConfirmed: fine.driverConfirmed,
          location: fine.location || '',
          violation: fine.violation,
          amount: fine.amount,
          fineDate: new Date(fine.fineDate).toISOString(),
          paid: !fine.paid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update payment status.');
      }

      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update payment status.'
      );
    }
  };

  const totalFinesAmount = fines.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0
  );

  const unpaidAmount = fines
    .filter((fine) => !fine.paid)
    .reduce((acc, fine) => acc + fine.amount, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(244,63,94,0.25)] border border-rose-300/40">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-white/20 border border-white/30 text-white text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-[0.15em] backdrop-blur-md">
              Compliance Hub
            </span>

            <h2 className="text-xl sm:text-2xl font-light mt-3 tracking-tight text-white">
              Traffic Fines & Violations
            </h2>

            <p className="text-rose-100 text-xs mt-1 max-w-sm font-light leading-relaxed opacity-90">
              Track vehicle penalties, verify driver attribution, and monitor
              payment statuses.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl text-right">
              <span className="text-[10px] uppercase tracking-[0.15em] text-rose-100 block">
                Total Penalties
              </span>
              <span className="text-xl font-medium text-white">
                AED {totalFinesAmount.toFixed(0)}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl text-right">
              <span className="text-[10px] uppercase tracking-[0.15em] text-rose-100 block">
                Unpaid
              </span>
              <span className="text-xl font-medium text-white">
                AED {unpaidAmount.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-medium">
          {error}
        </div>
      )}

      <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-6 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)]">
        <h3 className="text-xs font-medium text-slate-500 mb-4 tracking-[0.15em] uppercase">
          {editingId ? 'Edit Traffic Fine' : 'Record New Violation'}
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Vehicle
            </label>

            <select
              required
              value={vehicleNumber}
              onChange={(e) => {
                setVehicleNumber(e.target.value);
                setDriverConfirmed(false);
              }}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
            >
              <option value="">Select vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.name}>
                  {vehicle.name} — {vehicle.registrationNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Fine Date & Time
            </label>

            <input
              type="datetime-local"
              required
              value={fineDate}
              onChange={(e) => setFineDate(e.target.value)}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Fine Location
            </label>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dubai"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Responsible Driver
            </label>

            <select
              value={driverName}
              onChange={(e) => {
                setDriverName(e.target.value);
                setDriverConfirmed(false);
              }}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
            >
              <option value="">Unassigned</option>

              {suggestedDriverName &&
                !drivers.some((driver) => driver.name === suggestedDriverName) && (
                  <option value={suggestedDriverName}>
                    {suggestedDriverName} (booking suggestion)
                  </option>
                )}

              {driverName &&
                !drivers.some((driver) => driver.name === driverName) &&
                driverName !== suggestedDriverName && (
                  <option value={driverName}>{driverName}</option>
                )}

              {drivers.map((driver) => (
                <option key={driver.id} value={driver.name}>
                  {driver.name}
                </option>
              ))}
            </select>

            {suggestedDriverName && (
              <p className="text-[10px] text-cyan-700 mt-1">
                Booking suggests: {suggestedDriverName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Violation Description
            </label>

            <input
              type="text"
              required
              value={violation}
              onChange={(e) => setViolation(e.target.value)}
              placeholder="e.g. Speeding / Radar"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Amount (AED)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 600"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
            />
          </div>

          {matchedBooking && !editingId && (
            <div className="sm:col-span-2 lg:col-span-3 bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-xs text-slate-700">
              <p className="font-semibold text-cyan-800 mb-2">
                Possible matching booking — verify before assigning
              </p>

              <p>
                {new Date(matchedBooking.bookingDate).toLocaleString()}
              </p>

              <p>
                {matchedBooking.pickupLocation} → {matchedBooking.dropoffLocation}
              </p>

              <p>
                Booking driver: {matchedBooking.driverName || 'No driver assigned'}
              </p>

              <p className="text-[10px] text-cyan-700 mt-2">
                This is only a time-and-vehicle-based suggestion, not proof of
                who was driving.
              </p>
            </div>
          )}

          <div className="sm:col-span-2 lg:col-span-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <input
              id="driverConfirmed"
              type="checkbox"
              checked={driverConfirmed}
              onChange={(e) => setDriverConfirmed(e.target.checked)}
              className="mt-0.5"
            />

            <label
              htmlFor="driverConfirmed"
              className="text-xs text-amber-900"
            >
              I have checked the available information and confirmed or
              corrected the driver attribution. The booking match is not proof.
            </label>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
              />
              Fine already paid
            </label>

            <div className="flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-5 py-2.5 rounded-xl"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={submitting || vehicles.length === 0}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition disabled:opacity-50"
              >
                {submitting
                  ? 'Saving...'
                  : editingId
                    ? 'Save Changes'
                    : '+ Add Violation'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)] overflow-hidden">
        <div className="p-5 border-b border-sky-100 flex justify-between items-center">
          <h3 className="text-xs font-medium text-slate-600 tracking-[0.1em] uppercase">
            Violation Logs
          </h3>

          <span className="text-[11px] text-rose-700 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-200 font-medium">
            {fines.length} Penalties
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            LOADING COMPLIANCE DATA...
          </div>
        ) : fines.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No traffic fines recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sky-100 text-slate-500 font-medium">
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Violation</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date / Time</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sky-100/60">
                {fines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-white/60 transition">
                    <td className="p-4 font-medium text-slate-900">
                      {fine.vehicleNumber}
                    </td>

                    <td className="p-4 font-medium text-cyan-700">
                      {fine.driverName || 'Unassigned'}
                      {!fine.driverConfirmed && (
                        <span className="block text-[10px] text-amber-700">
                          Not confirmed
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-600">
                      {fine.location || '—'}
                    </td>

                    <td className="p-4 text-slate-700">
                      {fine.violation}
                    </td>

                    <td className="p-4 font-medium text-rose-600">
                      AED {fine.amount.toFixed(2)}
                    </td>

                    <td className="p-4 text-slate-600">
                      {new Date(fine.fineDate).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => togglePaid(fine)}
                        className={`px-2.5 py-1 rounded-md border text-[10px] font-medium uppercase ${
                          fine.paid
                            ? 'bg-emerald-500/10 text-emerald-800 border-emerald-200'
                            : 'bg-rose-500/10 text-rose-800 border-rose-200'
                        }`}
                      >
                        {fine.paid ? 'Settled' : 'Unpaid'}
                      </button>
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(fine)}
                        className="text-cyan-700 hover:text-cyan-900 font-medium"
                      >
                        Edit
                      </button>
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
