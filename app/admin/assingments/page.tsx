'use client';

import { useEffect, useState } from 'react';

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [assignVehicle, setAssignVehicle] = useState('Toyota Camry');
  const [assignDriver, setAssignDriver] = useState('');
  const [assignDate, setAssignDate] = useState('');
  const [assignTime, setAssignTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lookup Tool States
  const [lookupVehicle, setLookupVehicle] = useState('Toyota Camry');
  const [lookupDate, setLookupDate] = useState('');
  const [lookupResult, setLookupResult] = useState<any[] | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments');
      if (res.ok) setAssignments(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle: assignVehicle, driver: assignDriver, date: assignDate, time: assignTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      await fetchAssignments();
      setShowModal(false);
      setAssignDriver(''); setAssignDate(''); setAssignTime('');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-400">Vehicle Shift & Driver Assignments</h2>
          <p className="text-slate-400 text-sm">Assign drivers to fleet vehicles and search historical logs.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-md"
        >
          + Assign Driver to Car
        </button>
      </div>

      {/* LOOKUP TOOL */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
        <h3 className="text-xl font-semibold mb-2 text-amber-300">🔍 Vehicle Driver Lookup Tool</h3>
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
            <h4 className="text-xs font-semibold uppercase text-slate-400 mb-3">Lookup Results ({lookupResult.length} found)</h4>
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

      {/* ASSIGNMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-blue-400">Assign Driver to Vehicle</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {error && <div className="bg-red-950/50 border border-red-800 text-red-300 p-3 rounded-lg text-sm mb-4">{error}</div>}
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
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg text-sm transition">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}