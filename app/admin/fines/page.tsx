'use client';

import { useEffect, useState } from 'react';

export default function AdminFinesPage() {
  const [fines, setFines] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [fineVehicle, setFineVehicle] = useState('Toyota Camry');
  const [fineDriver, setFineDriver] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [fineReason, setFineReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      const res = await fetch('/api/fines');
      if (res.ok) setFines(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleCreateFine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/fines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle: fineVehicle, driver: fineDriver, amount: parseFloat(fineAmount) || 0, reason: fineReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      await fetchFines();
      setShowModal(false);
      setFineDriver(''); setFineAmount(''); setFineReason('');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const totalFinesAmount = fines.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-red-400">Traffic Fines & Violations Log</h2>
          <p className="text-slate-400 text-sm">Total Fines Recorded: AED {totalFinesAmount.toFixed(2)}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-red-900/60 hover:bg-red-900 text-red-200 border border-red-800 font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-md"
        >
          + Log Traffic Fine
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
        {fines.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">No traffic fines recorded yet.</p>
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

      {/* LOG FINE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-red-400">Log Traffic Fine</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {error && <div className="bg-red-950/50 border border-red-800 text-red-300 p-3 rounded-lg text-sm mb-4">{error}</div>}
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
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg text-sm transition">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}