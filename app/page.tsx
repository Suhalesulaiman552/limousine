'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states for Admin actions
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFareModal, setShowFareModal] = useState(false);
  const [showFineModal, setShowFineModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // Data lists state
  const [bookings, setBookings] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  // Lookup Tool States
  const [lookupVehicle, setLookupVehicle] = useState('Toyota Camry');
  const [lookupDate, setLookupDate] = useState('');
  const [lookupResult, setLookupResult] = useState<any[] | null>(null);

  // New Booking Form States
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('Toyota Camry');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Traffic Fine Form States
  const [fineVehicle, setFineVehicle] = useState('Toyota Camry');
  const [fineDriver, setFineDriver] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [fineReason, setFineReason] = useState('');
  const [fineLoading, setFineLoading] = useState(false);
  const [fineError, setFineError] = useState('');

  // Vehicle Assignment Form States
  const [assignVehicle, setAssignVehicle] = useState('Toyota Camry');
  const [assignDriver, setAssignDriver] = useState('');
  const [assignDate, setAssignDate] = useState('');
  const [assignTime, setAssignTime] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');

  // Fare Calculator Form States
  const [distanceKm, setDistanceKm] = useState('');
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState('3.15'); 
  const [carEfficiency, setCarEfficiency] = useState('10'); 
  const [markupPercent, setMarkupPercent] = useState('30'); 
  const [fareResult, setFareResult] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie.split(';');
    let userRole = null;
    let userName = null;

    cookies.forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key === 'user_role') userRole = value;
      if (key === 'user_name') userName = decodeURIComponent(value);
    });

    setRole(userRole);
    setName(userName);
    setLoading(false);

    if (userRole === 'ADMIN') {
      fetchBookings();
      fetchFines();
      fetchAssignments();
    }
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) setBookings(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchFines = async () => {
    try {
      const res = await fetch('/api/fines');
      if (res.ok) setFines(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments');
      if (res.ok) setAssignments(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setRole(null);
    setName(null);
    router.push('/login');
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, clientPhone, vehicle: selectedVehicle, pickup: pickupLocation, dropoff: dropoffLocation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      await fetchBookings();
      setShowBookingModal(false);
      setClientName(''); setClientPhone(''); setPickupLocation(''); setDropoffLocation('');
    } catch (err: any) { setBookingError(err.message); }
    finally { setBookingLoading(false); }
  };

  const handleCreateFine = async (e: React.FormEvent) => {
    e.preventDefault();
    setFineLoading(true);
    setFineError('');
    try {
      const res = await fetch('/api/fines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle: fineVehicle, driver: fineDriver, amount: parseFloat(fineAmount) || 0, reason: fineReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      await fetchFines();
      setShowFineModal(false);
      setFineDriver(''); setFineAmount(''); setFineReason('');
    } catch (err: any) { setFineError(err.message); }
    finally { setFineLoading(false); }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignLoading(true);
    setAssignError('');
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle: assignVehicle, driver: assignDriver, date: assignDate, time: assignTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      await fetchAssignments();
      setShowAssignmentModal(false);
      setAssignDriver(''); setAssignDate(''); setAssignTime('');
    } catch (err: any) { setAssignError(err.message); }
    finally { setAssignLoading(false); }
  };

  const handleLookupDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = assignments.filter(a => {
      const matchVehicle = a.vehicle.toLowerCase().includes(lookupVehicle.toLowerCase());
      const matchDate = lookupDate ? a.date === lookupDate : true;
      return matchVehicle && matchDate;
    });
    setLookupResult(matched);
  };

  const handleCalculateFare = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = parseFloat(distanceKm) || 0;
    const price = parseFloat(fuelPricePerLitre) || 0;
    const efficiency = parseFloat(carEfficiency) || 10;
    const markup = parseFloat(markupPercent) || 30;

    const litresNeeded = dist / efficiency;
    const fuelCost = litresNeeded * price;
    const calculatedFare = fuelCost * (1 + markup / 100);

    setFareResult({
      litres: litresNeeded.toFixed(2),
      fuelCost: fuelCost.toFixed(2),
      totalFare: calculatedFare.toFixed(2),
    });
  };

  const totalFinesAmount = fines.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading Al-Suhail Portal...
      </div>
    );
  }

  // PUBLIC LANDING PAGE
  if (!role) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 p-10 rounded-3xl text-center shadow-2xl">
          <div className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Secure Fleet Portal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Al-Suhail Limousine</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Private transport & limousine operations management in Dibba & Berlin. Authorized personnel and registered drivers only.
          </p>
          <div className="space-y-3">
            <Link href="/login" className="block w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-3 rounded-xl transition shadow-lg shadow-amber-500/10">
              Sign In to Portal
            </Link>
            <Link href="/register" className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition border border-slate-700">
              Driver Self-Registration
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // DRIVER VIEW
  if (role === 'DRIVER') {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-amber-400">Driver Portal</h1>
              <p className="text-slate-400 text-sm">Welcome back, {name || 'Driver'}</p>
            </div>
            <button onClick={handleLogout} className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-4 py-2 rounded-lg text-xs font-semibold transition">
              Sign Out
            </button>
          </header>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl mb-6">
            <h2 className="text-lg font-semibold text-amber-300 mb-2">Assigned Duty Status</h2>
            <p className="text-slate-300 text-sm">You are connected to the Al-Suhail dispatch network.</p>
            <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-medium">Status</span>
                <span className="text-emerald-400 font-semibold text-sm">● Ready for Dispatch</span>
              </div>
              <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold px-4 py-2 rounded-lg transition">
                Toggle Status
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ADMIN VIEW (Full Fleet Management)
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10 relative">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-amber-400">Al-Suhail Limousine Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Fleet Operations & Management Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 text-xs">
              Access: <span className="text-amber-400 font-semibold">ADMINISTRATOR</span>
            </div>
            <button onClick={handleLogout} className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-4 py-2 rounded-lg text-xs font-semibold transition">
              Sign Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-slate-400 text-xs font-semibold uppercase">Total Bookings</h3>
            <p className="text-3xl font-bold mt-2 text-white">{bookings.length}</p>
            <span className="text-xs text-emerald-400 mt-2 block">Synced with Neon DB</span>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-slate-400 text-xs font-semibold uppercase">Traffic Fines Total</h3>
            <p className="text-3xl font-bold mt-2 text-red-400">AED {totalFinesAmount.toFixed(2)}</p>
            <span className="text-xs text-slate-400 mt-2 block">{fines.length} fines recorded</span>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-slate-400 text-xs font-semibold uppercase">Shift Assignments</h3>
            <p className="text-3xl font-bold mt-2 text-amber-400">{assignments.length}</p>
            <span className="text-xs text-slate-400 mt-2 block">Vehicle logs active</span>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-slate-400 text-xs font-semibold uppercase">Database Status</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-400">Connected</p>
            <span className="text-xs text-slate-400 mt-2 block">Neon PostgreSQL</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-amber-300">Quick Fleet Control</h2>
          <p className="text-slate-300 text-sm mb-6">
            Manage bookings, assign drivers to vehicles, log traffic fines, and calculate trip fares instantly.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setShowBookingModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-5 py-2.5 rounded-lg transition text-sm shadow-md"
            >
              + New Booking
            </button>
            <button 
              onClick={() => setShowAssignmentModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm shadow-md"
            >
              + Assign Driver to Car
            </button>
            <button 
              onClick={() => setShowFineModal(true)}
              className="bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-800 font-semibold px-5 py-2.5 rounded-lg transition text-sm"
            >
              + Log Traffic Fine
            </button>
            <button 
              onClick={() => setShowFareModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-lg transition border border-slate-700 text-sm"
            >
              Calculate Trip Fare
            </button>
          </div>
        </div>

        {/* VEHICLE & DRIVER LOOKUP TOOL */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-2 text-amber-300">🔍 Vehicle Driver Lookup Tool</h2>
          <p className="text-slate-400 text-sm mb-4">Select a vehicle and date to find out which driver was assigned.</p>
          
          <form onSubmit={handleLookupDriver} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Vehicle</label>
              <select 
                value={lookupVehicle} 
                onChange={e => setLookupVehicle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Toyota Corolla">Toyota Corolla</option>
                <option value="Toyota Camry">Toyota Camry</option>
                <option value="Kia Carnival">Kia Carnival</option>
                <option value="Nissan Patrol">Nissan Patrol</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Date (Optional)</label>
              <input 
                type="date" 
                value={lookupDate} 
                onChange={e => setLookupDate(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
              />
            </div>
            <div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-2 rounded-lg text-sm transition">
                Search Driver
              </button>
            </div>
          </form>

          {lookupResult !== null && (
            <div className="mt-6 bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <h3 className="text-xs font-semibold uppercase text-slate-400 mb-3">Lookup Results ({lookupResult.length} found)</h3>
              {lookupResult.length === 0 ? (
                <p className="text-sm text-slate-400">No driver records found for this vehicle and date.</p>
              ) : (
                <div className="space-y-3">
                  {lookupResult.map(res => (
                    <div key={res.id} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800 text-sm">
                      <div>
                        <span className="text-amber-400 font-semibold block">{res.driver}</span>
                        <span className="text-xs text-slate-400">Vehicle: {res.vehicle}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-medium block">{res.date}</span>
                        <span className="text-xs text-emerald-400">Time: {res.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* LIVE BOOKINGS TABLE */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-amber-300">Active Bookings & Dispatch List</h2>
          {bookings.length === 0 ? (
            <p className="text-slate-400 text-sm py-4">No bookings logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-medium text-white">{b.clientName}</td>
                      <td className="py-3 px-4 text-slate-300">{b.clientPhone}</td>
                      <td className="py-3 px-4 text-amber-400">{b.vehicle}</td>
                      <td className="py-3 px-4 text-slate-300">{b.pickup} ➔ {b.dropoff}</td>
                      <td className="py-3 px-4">
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
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

        {/* TRAFFIC FINES TABLE */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Traffic Fines & Violations Log</h2>
          {fines.length === 0 ? (
            <p className="text-slate-400 text-sm py-4">No traffic fines recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Reason / Violation</th>
                    <th className="py-3 px-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {fines.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-medium text-amber-400">{f.vehicle}</td>
                      <td className="py-3 px-4 text-white">{f.driver}</td>
                      <td className="py-3 px-4 text-slate-300">{f.reason}</td>
                      <td className="py-3 px-4 text-red-400 font-bold">AED {f.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* NEW BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-amber-400">Create New Booking</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {bookingError && <div className="bg-red-950/50 border border-red-800 text-red-300 p-3 rounded-lg text-sm mb-4">{bookingError}</div>}
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Client Name</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="e.g. John Smith" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Client Phone</label>
                <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="+971501234567" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Assign Vehicle</label>
                <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                  <option value="Toyota Corolla">Toyota Corolla</option>
                  <option value="Toyota Camry">Toyota Camry</option>
                  <option value="Kia Carnival">Kia Carnival</option>
                  <option value="Nissan Patrol">Nissan Patrol</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Pickup Location</label>
                <input type="text" value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Dubai Airport" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Dropoff Location</label>
                <input type="text" value={dropoffLocation} onChange={e => setDropoffLocation(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Dibba, Fujairah" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg text-sm transition">Cancel</button>
                <button type="submit" disabled={bookingLoading} className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50">
                  {bookingLoading ? 'Saving...' : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN DRIVER TO CAR MODAL */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-blue-400">Assign Driver to Vehicle</h3>
              <button onClick={() => setShowAssignmentModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {assignError && <div className="bg-red-950/50 border border-red-800 text-red-300 p-3 rounded-lg text-sm mb-4">{assignError}</div>}
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Vehicle</label>
                <select value={assignVehicle} onChange={e => setAssignVehicle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                  <option value="Toyota Corolla">Toyota Corolla</option>
                  <option value="Toyota Camry">Toyota Camry</option>
                  <option value="Kia Carnival">Kia Carnival</option>
                  <option value="Nissan Patrol">Nissan Patrol</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Driver Name</label>
                <input type="text" value={assignDriver} onChange={e => setAssignDriver(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Ahmed Driver" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Date</label>
                  <input type="date" value={assignDate} onChange={e => setAssignDate(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Time</label>
                  <input type="time" value={assignTime} onChange={e => setAssignTime(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignmentModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg text-sm transition">Cancel</button>
                <button type="submit" disabled={assignLoading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50">
                  {assignLoading ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG TRAFFIC FINE MODAL */}
      {showFineModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-red-400">Log Traffic Fine</h3>
              <button onClick={() => setShowFineModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {fineError && <div className="bg-red-950/50 border border-red-800 text-red-300 p-3 rounded-lg text-sm mb-4">{fineError}</div>}
            <form onSubmit={handleCreateFine} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Vehicle</label>
                <select value={fineVehicle} onChange={e => setFineVehicle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                  <option value="Toyota Corolla">Toyota Corolla</option>
                  <option value="Toyota Camry">Toyota Camry</option>
                  <option value="Kia Carnival">Kia Carnival</option>
                  <option value="Nissan Patrol">Nissan Patrol</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Driver Name</label>
                <input type="text" value={fineDriver} onChange={e => setFineDriver(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Ahmed Driver" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Fine Amount (AED)</label>
                <input type="number" step="0.01" value={fineAmount} onChange={e => setFineAmount(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="e.g. 600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Violation Reason</label>
                <input type="text" value={fineReason} onChange={e => setFineReason(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Speeding" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowFineModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg text-sm transition">Cancel</button>
                <button type="submit" disabled={fineLoading} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50">
                  {fineLoading ? 'Saving...' : 'Save Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CALCULATE TRIP FARE MODAL */}
      {showFareModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-amber-400">Trip Fare & Fuel Calculator</h3>
              <button onClick={() => setShowFareModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCalculateFare} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Distance (KM)</label>
                <input type="number" step="0.1" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="e.g. 130" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Fuel Rate (AED/L)</label>
                  <input type="number" step="0.01" value={fuelPricePerLitre} onChange={e => setFuelPricePerLitre(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Efficiency (KM/L)</label>
                  <input type="number" step="0.1" value={carEfficiency} onChange={e => setCarEfficiency(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Profit Markup (%)</label>
                <input type="number" value={markupPercent} onChange={e => setMarkupPercent(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition mt-2">
                Calculate Estimate
              </button>
            </form>
            {fareResult && (
              <div className="mt-6 bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Fuel Required:</span>
                  <span className="text-white font-medium">{fareResult.litres} Litres</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Fuel Cost:</span>
                  <span className="text-white font-medium">AED {fareResult.fuelCost}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-amber-400 font-bold">
                  <span>Recommended Trip Fare:</span>
                  <span>AED {fareResult.totalFare}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}