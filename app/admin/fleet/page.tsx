'use client';

import { useCallback, useEffect, useState } from 'react';

type Driver = {
  id: string;
  name: string;
  phone: string | null;
  status: string;
};

type MaintenanceLog = {
  id: string;
  serviceType: string;
  serviceDate: string;
  serviceOdometerKm: number;
  intervalKm: number;
  nextOilChangeKm: number;
  notes: string | null;
};

type Vehicle = {
  id: string;
  name: string;
  make: string;
  model: string;
  registrationNumber: string;
  category: string;
  status: string;
  odometerKm: number | null;
  insuranceExpiry: string | null;
  registrationExpiry: string | null;
  notes: string | null;
  maintenanceLogs?: MaintenanceLog[];
};

type FleetData = {
  drivers: Driver[];
  vehicles: Vehicle[];
};

type OilAlertState =
  | {
      status: 'OVERDUE' | 'DUE_SOON' | 'OK';
      nextOilChangeKm: number;
      intervalKm: number;
      remainingKm: number | null;
      lastServiceDate: string;
      lastServiceKm: number;
    }
  | null;

function toDateInputValue(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(value: string | null): string {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString();
}

function getExpiryStatus(value: string | null): 'EXPIRED' | 'SOON' | 'OK' | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 30) return 'SOON';
  return 'OK';
}

function getOilStatus(vehicle: Vehicle): OilAlertState {
  const latestOil = vehicle.maintenanceLogs?.find(
    (log) => log.serviceType === 'OIL_CHANGE'
  );
  if (!latestOil) return null;

  if (vehicle.odometerKm === null || vehicle.odometerKm === undefined) {
    return {
      status: 'OK',
      nextOilChangeKm: latestOil.nextOilChangeKm,
      intervalKm: latestOil.intervalKm,
      remainingKm: null,
      lastServiceDate: latestOil.serviceDate,
      lastServiceKm: latestOil.serviceOdometerKm,
    };
  }

  const remainingKm = latestOil.nextOilChangeKm - vehicle.odometerKm;
  const status =
    remainingKm < 0 ? 'OVERDUE' : remainingKm <= 500 ? 'DUE_SOON' : 'OK';

  return {
    status,
    nextOilChangeKm: latestOil.nextOilChangeKm,
    intervalKm: latestOil.intervalKm,
    remainingKm,
    lastServiceDate: latestOil.serviceDate,
    lastServiceKm: latestOil.serviceOdometerKm,
  };
}

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [fleet, setFleet] = useState<FleetData>({
    drivers: [],
    vehicles: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState('SEDAN');
  const [vehicleStatus, setVehicleStatus] = useState('AVAILABLE');
  const [odometerKm, setOdometerKm] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [registrationExpiry, setRegistrationExpiry] = useState('');
  const [vehicleNotes, setVehicleNotes] = useState('');

  const [quickOdometerVehicleId, setQuickOdometerVehicleId] = useState<string | null>(null);
  const [quickOdometerValue, setQuickOdometerValue] = useState('');

  const [oilModalVehicle, setOilModalVehicle] = useState<Vehicle | null>(null);
  const [oilServiceOdometer, setOilServiceOdometer] = useState('');
  const [oilIntervalKm, setOilIntervalKm] = useState<5000 | 10000>(5000);
  const [oilServiceDate, setOilServiceDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [oilNotes, setOilNotes] = useState('');

  const fetchFleet = useCallback(async () => {
    try {
      setError('');
      const response = await fetch('/api/fleet', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load fleet.');
      }

      setFleet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load fleet.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFleet();
  }, [fetchFleet]);

  const resetVehicleForm = () => {
    setEditingVehicleId(null);
    setVehicleName('');
    setVehicleMake('');
    setVehicleModel('');
    setRegistrationNumber('');
    setVehicleCategory('SEDAN');
    setVehicleStatus('AVAILABLE');
    setOdometerKm('');
    setInsuranceExpiry('');
    setRegistrationExpiry('');
    setVehicleNotes('');
  };

  const startEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setVehicleName(vehicle.name);
    setVehicleMake(vehicle.make);
    setVehicleModel(vehicle.model);
    setRegistrationNumber(vehicle.registrationNumber);
    setVehicleCategory(vehicle.category);
    setVehicleStatus(vehicle.status || 'AVAILABLE');
    setOdometerKm(
      vehicle.odometerKm !== null && vehicle.odometerKm !== undefined
        ? String(vehicle.odometerKm)
        : ''
    );
    setInsuranceExpiry(toDateInputValue(vehicle.insuranceExpiry));
    setRegistrationExpiry(toDateInputValue(vehicle.registrationExpiry));
    setVehicleNotes(vehicle.notes || '');
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openOilChangeLogger = (vehicle: Vehicle) => {
    setOilModalVehicle(vehicle);
    setOilServiceOdometer(
      vehicle.odometerKm !== null && vehicle.odometerKm !== undefined
        ? String(vehicle.odometerKm)
        : ''
    );
    const lastOil = vehicle.maintenanceLogs?.find(
      (log) => log.serviceType === 'OIL_CHANGE'
    );
    setOilIntervalKm(lastOil?.intervalKm === 10000 ? 10000 : 5000);
    setOilServiceDate(new Date().toISOString().slice(0, 10));
    setOilNotes('');
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveOilChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!oilModalVehicle) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'oil_change',
          vehicleId: oilModalVehicle.id,
          serviceOdometerKm: Number(oilServiceOdometer),
          intervalKm: oilIntervalKm,
          serviceDate: oilServiceDate,
          notes: oilNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to log oil change.');
      }

      const nextKm = Number(oilServiceOdometer) + oilIntervalKm;
      setSuccess(
        `Oil change logged for ${oilModalVehicle.name}. Next oil change at ${nextKm.toLocaleString()} km.`
      );
      setOilModalVehicle(null);
      setOilNotes('');
      await fetchFleet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log oil change.');
    } finally {
      setSaving(false);
    }
  };

  const saveQuickOdometer = async (vehicle: Vehicle) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/fleet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vehicle.id,
          odometerKm: Number(quickOdometerValue),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update odometer.');
      }

      setQuickOdometerVehicleId(null);
      setQuickOdometerValue('');
      setSuccess(
        `${vehicle.name} odometer updated to ${Number(quickOdometerValue).toLocaleString()} km.`
      );
      await fetchFleet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update odometer.');
    } finally {
      setSaving(false);
    }
  };

  const addDriver = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'driver',
          name: driverName,
          phone: driverPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to add driver.');
      }

      setDriverName('');
      setDriverPhone('');
      setSuccess('Driver added successfully.');
      await fetchFleet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add driver.');
    } finally {
      setSaving(false);
    }
  };

  const saveVehicle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const isEditing = editingVehicleId !== null;
      const response = await fetch('/api/fleet', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEditing ? { id: editingVehicleId, status: vehicleStatus } : { type: 'vehicle' }),
          name: vehicleName,
          make: vehicleMake,
          model: vehicleModel,
          registrationNumber,
          category: vehicleCategory,
          odometerKm: odometerKm.trim() === '' ? null : Number(odometerKm),
          insuranceExpiry: insuranceExpiry || null,
          registrationExpiry: registrationExpiry || null,
          notes: vehicleNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save vehicle.');
      }

      resetVehicleForm();
      setSuccess(isEditing ? 'Vehicle updated successfully.' : 'Vehicle added successfully.');
      await fetchFleet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save vehicle.');
    } finally {
      setSaving(false);
    }
  };

  const oilAlertVehicles = fleet.vehicles
    .map((v) => ({ vehicle: v, oil: getOilStatus(v) }))
    .filter(
      (item): item is { vehicle: Vehicle; oil: NonNullable<OilAlertState> } =>
        item.oil !== null &&
        (item.oil.status === 'DUE_SOON' || item.oil.status === 'OVERDUE')
    );

  const parsedOilServiceOdo = Number(oilServiceOdometer);
  const previewNextOilKm =
    oilServiceOdometer.trim() !== '' &&
    Number.isFinite(parsedOilServiceOdo) &&
    parsedOilServiceOdo >= 0
      ? Math.round(parsedOilServiceOdo) + oilIntervalKm
      : null;

  const inputClass =
    'w-full rounded-xl border border-sky-200 bg-white/80 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100';

  const labelClass =
    'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500';

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Operations
          </p>
          <h2 className="mt-1 text-2xl font-light tracking-tight text-slate-900">
            Fleet Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your drivers, registered vehicles, weekly odometer, and oil changes.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchFleet}
          className="rounded-xl border border-sky-200 bg-white/70 px-4 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-white"
        >
          Refresh Fleet
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Registered Vehicles
          </p>
          <p className="mt-2 text-3xl font-light text-slate-900">
            {fleet.vehicles.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Registered Drivers
          </p>
          <p className="mt-2 text-3xl font-light text-slate-900">
            {fleet.drivers.length}
          </p>
        </div>
      </div>

      <div className="flex gap-2 rounded-2xl border border-sky-200/60 bg-white/50 p-1.5">
        <button
          type="button"
          onClick={() => {
            setActiveTab('vehicles');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
            activeTab === 'vehicles'
              ? 'bg-cyan-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          Vehicles ({fleet.vehicles.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('drivers');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
            activeTab === 'drivers'
              ? 'bg-cyan-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          Drivers ({fleet.drivers.length})
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {activeTab === 'vehicles' && (
        <>
          {oilAlertVehicles.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Oil Change Reminder
              </p>
              <div className="mt-2 space-y-1.5">
                {oilAlertVehicles.map(({ vehicle, oil }) => (
                  <div
                    key={vehicle.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900"
                  >
                    <span>
                      <strong className="font-semibold">{vehicle.name}</strong> (
                      {vehicle.registrationNumber}) —{' '}
                      {oil.status === 'OVERDUE'
                        ? `Overdue by ${Math.abs(oil.remainingKm ?? 0).toLocaleString()} km (due at ${oil.nextOilChangeKm.toLocaleString()} km)`
                        : `${(oil.remainingKm ?? 0).toLocaleString()} km left before ${oil.nextOilChangeKm.toLocaleString()} km`}
                    </span>
                    <button
                      type="button"
                      onClick={() => openOilChangeLogger(vehicle)}
                      className="rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-amber-700"
                    >
                      Log Oil Change
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {oilModalVehicle && (
            <section className="rounded-2xl border border-cyan-200 bg-white/85 p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-600">
                    Maintenance Log
                  </p>
                  <h3 className="mt-0.5 text-base font-medium text-slate-900">
                    Log Oil Change — {oilModalVehicle.name} ({oilModalVehicle.registrationNumber})
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Select 5,000 km or 10,000 km oil. The system calculates the next due km automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOilModalVehicle(null)}
                  className="rounded-lg border border-sky-200 bg-white px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <form onSubmit={saveOilChange} className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Odometer at Oil Change (km)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={inputClass}
                    placeholder="e.g. 94650"
                    value={oilServiceOdometer}
                    onChange={(e) => setOilServiceOdometer(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Oil Type / Interval</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOilIntervalKm(5000)}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        oilIntervalKm === 5000
                          ? 'border-cyan-500 bg-cyan-500 text-white shadow-sm'
                          : 'border-sky-200 bg-white/80 text-slate-700 hover:bg-white'
                      }`}
                    >
                      5,000 km Oil
                    </button>
                    <button
                      type="button"
                      onClick={() => setOilIntervalKm(10000)}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        oilIntervalKm === 10000
                          ? 'border-cyan-500 bg-cyan-500 text-white shadow-sm'
                          : 'border-sky-200 bg-white/80 text-slate-700 hover:bg-white'
                      }`}
                    >
                      10,000 km Oil
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Service Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={oilServiceDate}
                    onChange={(e) => setOilServiceDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Notes (Optional)</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Oil filter replaced, 5W-30"
                    value={oilNotes}
                    onChange={(e) => setOilNotes(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3 sm:col-span-2">
                  <span className="text-xs text-slate-600">
                    Next Oil Change Due At:{' '}
                    <strong className="text-sm font-semibold text-slate-900">
                      {previewNextOilKm !== null
                        ? `${previewNextOilKm.toLocaleString()} km`
                        : 'Enter odometer above'}
                    </strong>
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOilModalVehicle(null)}
                      disabled={saving}
                      className="rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Oil Change'}
                    </button>
                  </div>
                </div>
              </form>
            </section>
          )}

          <section className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-sm sm:p-6">
            <h3 className="text-base font-medium text-slate-900">
              {editingVehicleId ? 'Update Vehicle Details' : 'Register a Vehicle'}
            </h3>
            <p className="mb-5 mt-1 text-xs text-slate-500">
              {editingVehicleId
                ? 'Update odometer reading, insurance/registration expiry dates, or notes.'
                : 'Add each vehicle once. Its registration number will be stored.'}
            </p>

            <form onSubmit={saveVehicle} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Vehicle Name</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Camry"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Make</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Toyota"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Model</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Camry"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Registration Number</label>
                <input
                  className={inputClass}
                  placeholder="Enter number plate"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  className={inputClass}
                  value={vehicleCategory}
                  onChange={(e) => setVehicleCategory(e.target.value)}
                >
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="VAN">Van</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Odometer (km)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  placeholder="e.g. 85000"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Insurance Expiry</label>
                <input
                  type="date"
                  className={inputClass}
                  value={insuranceExpiry}
                  onChange={(e) => setInsuranceExpiry(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Registration Expiry</label>
                <input
                  type="date"
                  className={inputClass}
                  value={registrationExpiry}
                  onChange={(e) => setRegistrationExpiry(e.target.value)}
                />
              </div>

              {editingVehicleId && (
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    className={inputClass}
                    value={vehicleStatus}
                    onChange={(e) => setVehicleStatus(e.target.value)}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>
              )}

              <div className={editingVehicleId ? '' : 'sm:col-span-2'}>
                <label className={labelClass}>Notes (Optional)</label>
                <input
                  className={inputClass}
                  placeholder="Additional information"
                  value={vehicleNotes}
                  onChange={(e) => setVehicleNotes(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-cyan-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-600 disabled:opacity-50 sm:w-auto"
                >
                  {saving
                    ? 'Saving...'
                    : editingVehicleId
                      ? 'Save Changes'
                      : 'Add Vehicle'}
                </button>

                {editingVehicleId && (
                  <button
                    type="button"
                    onClick={resetVehicleForm}
                    disabled={saving}
                    className="w-full rounded-xl border border-sky-200 bg-white/80 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-white disabled:opacity-50 sm:w-auto"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-slate-900">
                Registered Vehicles
              </h3>
              <span className="text-xs text-slate-500">
                {fleet.vehicles.length} total
              </span>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading vehicles...
              </p>
            ) : fleet.vehicles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-white/40 px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No vehicles registered yet.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Add your first vehicle using the form above.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {fleet.vehicles.map((vehicle) => {
                  const insuranceState = getExpiryStatus(vehicle.insuranceExpiry);
                  const registrationState = getExpiryStatus(vehicle.registrationExpiry);
                  const oilState = getOilStatus(vehicle);
                  const isQuickEditingOdo = quickOdometerVehicleId === vehicle.id;

                  return (
                    <div
                      key={vehicle.id}
                      className="rounded-2xl border border-white/70 bg-white/65 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-medium text-slate-900">
                            {vehicle.name}
                          </h4>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {vehicle.make} {vehicle.model}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openOilChangeLogger(vehicle)}
                            className="rounded-lg border border-cyan-200 bg-cyan-50/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-700 transition hover:bg-cyan-100/80"
                          >
                            Oil Change
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditVehicle(vehicle)}
                            className="rounded-lg border border-sky-200 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-white"
                          >
                            Edit
                          </button>
                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                            {vehicle.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2 border-t border-sky-100 pt-4">
                        <div className="flex justify-between gap-3 text-xs">
                          <span className="text-slate-500">Registration</span>
                          <span className="font-medium text-slate-800">
                            {vehicle.registrationNumber}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3 text-xs">
                          <span className="text-slate-500">Category</span>
                          <span className="font-medium text-slate-800">
                            {vehicle.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-500">Odometer</span>
                          {isQuickEditingOdo ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                className="w-28 rounded-lg border border-sky-300 bg-white px-2 py-1 text-right text-xs text-slate-800 outline-none focus:border-cyan-500"
                                value={quickOdometerValue}
                                onChange={(e) => setQuickOdometerValue(e.target.value)}
                              />
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => saveQuickOdometer(vehicle)}
                                className="rounded-lg bg-cyan-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-cyan-600"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setQuickOdometerVehicleId(null)}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-500"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <span className="flex items-center gap-2 font-medium text-slate-800">
                              <span>
                                {vehicle.odometerKm !== null &&
                                vehicle.odometerKm !== undefined
                                  ? `${vehicle.odometerKm.toLocaleString()} km`
                                  : 'Not set'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickOdometerVehicleId(vehicle.id);
                                  setQuickOdometerValue(
                                    vehicle.odometerKm !== null &&
                                      vehicle.odometerKm !== undefined
                                      ? String(vehicle.odometerKm)
                                      : ''
                                  );
                                }}
                                className="rounded border border-sky-200 bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700 hover:bg-white"
                              >
                                Update Km
                              </button>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-500">Next Oil Change</span>
                          {oilState ? (
                            <span className="flex flex-wrap items-center justify-end gap-1.5 font-medium text-slate-800">
                              <span>
                                {oilState.nextOilChangeKm.toLocaleString()} km
                              </span>
                              {oilState.status === 'OVERDUE' && (
                                <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                                  Overdue ({Math.abs(oilState.remainingKm ?? 0).toLocaleString()} km)
                                </span>
                              )}
                              {oilState.status === 'DUE_SOON' && (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                  Due in {(oilState.remainingKm ?? 0).toLocaleString()} km
                                </span>
                              )}
                              {oilState.status === 'OK' &&
                                oilState.remainingKm !== null && (
                                  <span className="text-[11px] font-normal text-slate-500">
                                    ({oilState.remainingKm.toLocaleString()} km left)
                                  </span>
                                )}
                            </span>
                          ) : (
                            <span className="text-slate-400">Not logged yet</span>
                          )}
                        </div>

                        {oilState && (
                          <div className="flex justify-between gap-3 text-[11px] text-slate-500">
                            <span>Last Oil Service</span>
                            <span>
                              {oilState.lastServiceKm.toLocaleString()} km ·{' '}
                              {oilState.intervalKm.toLocaleString()} km oil (
                              {formatDisplayDate(oilState.lastServiceDate)})
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-500">Insurance Expiry</span>
                          <span className="flex items-center gap-1.5 font-medium text-slate-800">
                            <span>{formatDisplayDate(vehicle.insuranceExpiry)}</span>
                            {insuranceState === 'EXPIRED' && (
                              <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                                Expired
                              </span>
                            )}
                            {insuranceState === 'SOON' && (
                              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                Due Soon
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-500">Registration Expiry</span>
                          <span className="flex items-center gap-1.5 font-medium text-slate-800">
                            <span>{formatDisplayDate(vehicle.registrationExpiry)}</span>
                            {registrationState === 'EXPIRED' && (
                              <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                                Expired
                              </span>
                            )}
                            {registrationState === 'SOON' && (
                              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                Due Soon
                              </span>
                            )}
                          </span>
                        </div>
                        {vehicle.notes && (
                          <p className="pt-2 text-xs text-slate-500">
                            {vehicle.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === 'drivers' && (
        <>
          <section className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-sm sm:p-6">
            <h3 className="text-base font-medium text-slate-900">
              Register a Driver
            </h3>
            <p className="mb-5 mt-1 text-xs text-slate-500">
              Phone number is optional. You can add it later.
            </p>

            <form onSubmit={addDriver} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Driver Name</label>
                <input
                  className={inputClass}
                  placeholder="Enter driver name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number (Optional)</label>
                <input
                  className={inputClass}
                  placeholder="Enter phone number"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-cyan-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-600 disabled:opacity-50 sm:w-auto"
                >
                  {saving ? 'Saving...' : 'Add Driver'}
                </button>
              </div>
            </form>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-slate-900">
                Registered Drivers
              </h3>
              <span className="text-xs text-slate-500">
                {fleet.drivers.length} total
              </span>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading drivers...
              </p>
            ) : fleet.drivers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-white/40 px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No drivers registered yet.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Add your first driver using the form above.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {fleet.drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="rounded-2xl border border-white/70 bg-white/65 p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-lg font-medium text-slate-900">
                        {driver.name}
                      </h4>
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        {driver.status}
                      </span>
                    </div>
                    <div className="mt-4 border-t border-sky-100 pt-4">
                      <p className="text-xs text-slate-500">Phone number</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {driver.phone || 'Not added yet'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}