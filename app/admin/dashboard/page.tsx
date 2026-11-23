
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MaintenanceLog {
  serviceType: string;
  nextOilChangeKm: number;
}

interface FleetVehicle {
  id: string;
  name: string;
  registrationNumber: string;
  odometerKm: number | null;
  insuranceExpiry: string | null;
  registrationExpiry: string | null;
  maintenanceLogs: MaintenanceLog[];
}

interface Booking {
  id: string;
  bookingDate: string;
  status: string;
}

interface Fine {
  amount: number;
  paid: boolean;
}

interface FleetAlert {
  id: string;
  vehicleName: string;
  registrationNumber: string;
  issue: string;
  detail: string;
  severity: 'overdue' | 'warning';
}

function getUaeDayBounds() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = Number(parts.find(p => p.type === 'year')?.value);
  const month = Number(parts.find(p => p.type === 'month')?.value);
  const day = Number(parts.find(p => p.type === 'day')?.value);

  // UAE is UTC+4. These boundaries represent UAE midnight in UTC.
  const start = new Date(Date.UTC(year, month - 1, day) - 4 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end, now };
}

function getDaysUntil(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();

  const expiryDay = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );

  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  return Math.ceil((expiryDay - today) / 86400000);
}

function getExpiryMessage(days: number): string {
  if (days < 0) return `Expired ${Math.abs(days)} days ago`;
  if (days === 0) return 'Expires today';
  return `Expires in ${days} days`;
}

export default function AdminDashboard() {
  const [completedToday, setCompletedToday] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState(0);
  const [unpaidFines, setUnpaidFines] = useState(0);
  const [fleetCount, setFleetCount] = useState(0);
  const [fleetAlerts, setFleetAlerts] = useState<FleetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [bookingsRes, finesRes, fleetRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/fines'),
          fetch('/api/fleet'),
        ]);

        if (!bookingsRes.ok || !finesRes.ok || !fleetRes.ok) {
          throw new Error('Could not load dashboard information.');
        }

        const [bookingsData, finesData, fleetData] = await Promise.all([
          bookingsRes.json(),
          finesRes.json(),
          fleetRes.json(),
        ]);

        if (
          !Array.isArray(bookingsData) ||
          !Array.isArray(finesData) ||
          !Array.isArray(fleetData?.vehicles)
        ) {
          throw new Error('Invalid dashboard data received.');
        }

        if (!active) return;

        const { start, end, now } = getUaeDayBounds();

        const completed = (bookingsData as Booking[]).filter(booking => {
          const bookingTime = new Date(booking.bookingDate).getTime();

          return (
            booking.status === 'COMPLETED' &&
            bookingTime >= start.getTime() &&
            bookingTime < end.getTime()
          );
        });

        const upcoming = (bookingsData as Booking[]).filter(booking => {
          const bookingTime = new Date(booking.bookingDate).getTime();

          return (
            bookingTime >= now.getTime() &&
            booking.status !== 'COMPLETED' &&
            booking.status !== 'CANCELLED'
          );
        });

        const unpaid = (finesData as Fine[])
          .filter(fine => !fine.paid)
          .reduce((total, fine) => total + Number(fine.amount || 0), 0);

        setCompletedToday(completed.length);
        setUpcomingBookings(upcoming.length);
        setUnpaidFines(unpaid);
        setFleetCount(fleetData.vehicles.length);

        const alerts: FleetAlert[] = [];

        (fleetData.vehicles as FleetVehicle[]).forEach(vehicle => {
          const vehicleName = vehicle.name;
          const registrationNumber = vehicle.registrationNumber;

          const latestOilChange = (vehicle.maintenanceLogs || []).find(
            log => log.serviceType === 'OIL_CHANGE'
          );

          if (
            latestOilChange &&
            vehicle.odometerKm !== null &&
            vehicle.odometerKm !== undefined
          ) {
            const remainingKm =
              latestOilChange.nextOilChangeKm - vehicle.odometerKm;

            if (remainingKm < 0) {
              alerts.push({
                id: `${vehicle.id}-oil`,
                vehicleName,
                registrationNumber,
                issue: 'Oil Change Overdue',
                detail: `${Math.abs(remainingKm).toLocaleString()} km overdue`,
                severity: 'overdue',
              });
            } else if (remainingKm <= 500) {
              alerts.push({
                id: `${vehicle.id}-oil`,
                vehicleName,
                registrationNumber,
                issue: 'Oil Change Due Soon',
                detail: `${remainingKm.toLocaleString()} km remaining`,
                severity: 'warning',
              });
            }
          }

          if (vehicle.insuranceExpiry) {
            const days = getDaysUntil(vehicle.insuranceExpiry);

            if (days <= 30) {
              alerts.push({
                id: `${vehicle.id}-insurance`,
                vehicleName,
                registrationNumber,
                issue: 'Insurance Expiry',
                detail: getExpiryMessage(days),
                severity: days < 0 ? 'overdue' : 'warning',
              });
            }
          }

          if (vehicle.registrationExpiry) {
            const days = getDaysUntil(vehicle.registrationExpiry);

            if (days <= 30) {
              alerts.push({
                id: `${vehicle.id}-registration`,
                vehicleName,
                registrationNumber,
                issue: 'Mulkiya Expiry',
                detail: getExpiryMessage(days),
                severity: days < 0 ? 'overdue' : 'warning',
              });
            }
          }
        });

        setFleetAlerts(alerts);
        setLoadError('');
      } catch (error) {
        console.error('Dashboard loading error:', error);

        if (active) {
          setLoadError('Unable to load dashboard data. Please refresh.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const overdueCount = fleetAlerts.filter(
    alert => alert.severity === 'overdue'
  ).length;

  return (
    <div className="space-y-8">

      {/* Main Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 text-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.25)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-cyan-300/40">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative z-10">
          <span className="bg-white/20 border border-white/30 text-white text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-[0.15em] backdrop-blur-md">
            Active Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-light mt-3 tracking-tight text-white">
            Fleet Operations
          </h2>
          <p className="text-sky-100 text-xs mt-1 max-w-sm font-light leading-relaxed opacity-90">
            Daily bookings, upcoming trips, outstanding fines and fleet alerts.
          </p>
          <p className="text-sky-100 text-[10px] mt-2">
            Business day follows UAE time (GMT+4).
          </p>
        </div>

        <Link
          href="/admin/bookings"
          className="relative z-10 w-full sm:w-auto text-center bg-white hover:bg-sky-50 text-slate-900 text-xs font-medium px-5 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.02]"
        >
          + New Booking
        </Link>
      </div>

      {loadError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs">
          {loadError}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)] hover:border-cyan-400 transition-all duration-300">
          <h3 className="text-slate-500 text-[11px] font-medium tracking-[0.1em] uppercase">
            Completed Today
          </h3>
          <p className="text-2xl sm:text-3xl font-light mt-2 text-slate-900">
            {loading ? '...' : completedToday}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span className="text-[10px] text-cyan-700 font-medium tracking-wide">
              UAE calendar day
            </span>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)] hover:border-blue-400 transition-all duration-300">
          <h3 className="text-slate-500 text-[11px] font-medium tracking-[0.1em] uppercase">
            Upcoming Bookings
          </h3>
          <p className="text-2xl sm:text-3xl font-light mt-2 text-slate-900">
            {loading ? '...' : upcomingBookings}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] text-blue-700 font-medium tracking-wide">
              Yet to be completed
            </span>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)] hover:border-rose-400 transition-all duration-300">
          <h3 className="text-slate-500 text-[11px] font-medium tracking-[0.1em] uppercase">
            Unpaid Fines
          </h3>
          <p className="text-2xl sm:text-3xl font-light mt-2 text-rose-600">
            {loading ? '...' : `AED ${unpaidFines.toFixed(0)}`}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[10px] text-rose-600 font-medium tracking-wide">
              Outstanding amount
            </span>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-5 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)] hover:border-emerald-400 transition-all duration-300">
          <h3 className="text-slate-500 text-[11px] font-medium tracking-[0.1em] uppercase">
            Fleet Vehicles
          </h3>
          <p className="text-2xl sm:text-3xl font-light mt-2 text-emerald-600">
            {loading ? '...' : fleetCount}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-emerald-700 font-medium tracking-wide">
              Registered vehicles
            </span>
          </div>
        </div>

      </div>

      {/* Fleet Attention Needed */}
      <div className="bg-white/70 backdrop-blur-xl border border-sky-200/80 rounded-2xl shadow-[0_4px_20px_0_rgba(2,132,199,0.06)] overflow-hidden">

        <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-sky-100">
          <div>
            <h3 className="text-slate-900 text-sm font-semibold tracking-wide">
              Fleet Attention Needed
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Maintenance and document expiry alerts
            </p>
          </div>

          {!loading && (
            <div className="flex gap-2">
              {overdueCount > 0 && (
                <span className="bg-rose-100 text-rose-700 text-[10px] font-semibold px-3 py-1.5 rounded-full">
                  {overdueCount} Overdue
                </span>
              )}

              <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-3 py-1.5 rounded-full">
                {fleetAlerts.length} Alerts
              </span>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">

          {loading ? (
            <p className="text-slate-400 text-xs">Checking fleet...</p>
          ) : fleetAlerts.length === 0 ? (
            <div className="flex items-center gap-3 py-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                ✓
              </span>
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  All clear
                </p>
                <p className="text-xs text-slate-500">
                  No upcoming maintenance or document expiry alerts.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {fleetAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${
                    alert.severity === 'overdue'
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div>
                    <p className={`text-xs font-semibold ${
                      alert.severity === 'overdue'
                        ? 'text-rose-700'
                        : 'text-amber-700'
                    }`}>
                      {alert.issue}
                    </p>
                    <p className="text-sm font-medium text-slate-800 mt-1">
                      {alert.vehicleName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {alert.registrationNumber}
                    </p>
                  </div>

                  <span className={`text-xs font-semibold ${
                    alert.severity === 'overdue'
                      ? 'text-rose-700'
                      : 'text-amber-700'
                  }`}>
                    {alert.detail}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-sky-100">
            <Link
              href="/admin/fleet"
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors"
            >
              View Fleet Management →
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

