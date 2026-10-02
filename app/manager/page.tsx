'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const [petrols, setPetrols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Radar Fine Search States
  const [plate, setPlate] = useState('A-12345');
  const [fineDate, setFineDate] = useState(new Date().toISOString().split('T')[0]);
  const [fineTime, setFineTime] = useState('12:00');
  const [fineResult, setFineResult] = useState<any>(null);
  const [searchingFine, setSearchingFine] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const tripRes = await fetch('/api/trips');
        const tripData = await tripRes.json();
        if (tripData.success) setTrips(tripData.trips);

        const petrolRes = await fetch('/api/petrol');
        const petrolData = await petrolRes.json();
        if (petrolData.success) setPetrols(petrolData.transactions);
      } catch (err) {
        console.error('Failed to fetch manager data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFineSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchingFine(true);
    setFineResult(null);

    try {
      const res = await fetch('/api/fines/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plateNumber: plate, date: fineDate, time: fineTime }),
      });
      const data = await res.json();
      if (data.success) {
        setFineResult(data.match);
      } else {
        alert(data.error || 'No match found');
      }
    } catch (err) {
      alert('Error searching fine records');
    } finally {
      setSearchingFine(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const totalRevenue = trips.reduce((acc, t) => acc + (t.price || 0), 0);
  const totalPetrolCost = petrols.reduce((acc, p) => acc + (p.amount || 0), 0);
  const netProfit = totalRevenue - totalPetrolCost;

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">Loading executive dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 p-6 md:p-10 selection:bg-sky-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 1. Header Navigation Bar */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <p className="text-[11px] uppercase tracking-widest text-sky-600 font-extrabold">Al-Suhail Fleet Management</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Executive Command Center</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 px-4 py-2.5 rounded-2xl transition-all">
            Sign Out
          </button>
        </div>

        {/* 2. Top Financial KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Trip Revenue</p>
            <p className="text-3xl font-black text-sky-600 tracking-tight">{totalRevenue.toFixed(2)} <span className="text-xs font-semibold text-slate-400">AED</span></p>
          </div>
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Petrol Expenses</p>
            <p className="text-3xl font-black text-emerald-600 tracking-tight">{totalPetrolCost.toFixed(2)} <span className="text-xs font-semibold text-slate-400">AED</span></p>
          </div>
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Net Fleet Margin</p>
            <p className="text-3xl font-black text-indigo-600 tracking-tight">{netProfit.toFixed(2)} <span className="text-xs font-semibold text-slate-400">AED</span></p>
          </div>
        </div>

        {/* 3. Main Structured Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Radar Fine Tool (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-white via-sky-50/50 to-sky-100/30 border border-sky-200/80 p-6 md:p-7 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl p-2 bg-sky-500/10 rounded-xl">🚨</span>
                <div>
                  <h2 className="text-lg font-bold text-sky-950">Radar Fine Matcher</h2>
                  <p className="text-xs text-slate-500">Cross-reference traffic citations with driver logs.</p>
                </div>
              </div>

              <form onSubmit={handleFineSearch} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Plate Number</label>
                  <input type="text" value={plate} onChange={(e) => setPlate(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" placeholder="e.g. A-12345" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Date</label>
                    <input type="date" value={fineDate} onChange={(e) => setFineDate(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Time</label>
                    <input type="time" value={fineTime} onChange={(e) => setFineTime(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" required />
                  </div>
                </div>
                <button type="submit" disabled={searchingFine} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 rounded-2xl text-sm shadow-md shadow-sky-600/20 transition-all">
                  {searchingFine ? 'Matching Record...' : 'Identify Driver'}
                </button>
              </form>

              {fineResult && (
                <div className="mt-5 p-4 bg-white rounded-2xl border border-sky-300 shadow-sm space-y-2">
                  <p className="text-[10px] font-extrabold text-sky-600 uppercase tracking-widest">Match Confirmed</p>
                  <p className="text-base font-bold text-slate-900">
                    {fineResult.driverName} <span className="text-xs text-slate-500 font-normal">({fineResult.vehicleModel} - {fineResult.plateNumber})</span>
                  </p>
                  {fineResult.matchedTrip && (
                    <p className="text-xs text-slate-500">
                      Route: {fineResult.matchedTrip.customerName} → {fineResult.matchedTrip.destination}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Transaction Feeds (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Trips Feed */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Recent Trips</h2>
                <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl">{trips.length} Total</span>
              </div>

              {trips.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No trip records found.</p>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {trips.map((trip) => (
                    <div key={trip.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{trip.customerName} <span className="text-slate-400 font-normal">({trip.destination})</span></p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Driver: <span className="text-sky-600 font-semibold">{trip.driver?.name || 'Driver'}</span> • {trip.date}</p>
                      </div>
                      <span className="font-bold text-sky-600 text-sm">+{trip.price} AED</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Petrol Feed */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Petrol Expenses & Receipts</h2>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">{petrols.length} Total</span>
              </div>

              {petrols.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No petrol logs recorded.</p>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {petrols.map((petrol) => (
                    <div key={petrol.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{petrol.liters} Liters</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Driver: <span className="text-emerald-600 font-semibold">{petrol.driver?.name || 'Driver'}</span> • {petrol.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-600 text-sm">{petrol.amount} AED</span>
                        {petrol.receiptImage && (
                          <a href={petrol.receiptImage} target="_blank" rel="noreferrer" className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition">
                            Receipt
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}