'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddTripPage() {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState(''); // Added phone state back
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Session expired. Please log in again.');
      router.push('/login');
      return;
    }

    const fullDestinationRoute = `From: ${pickup} → To: ${destination}`;

    setLoading(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: user.driverId,
          customerName,
          phone, // Sending phone number
          destination: fullDestinationRoute,
          price: parseFloat(price),
          date,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/driver');
      } else {
        alert(data.error || 'Failed to add trip');
      }
    } catch (err) {
      alert('Error submitting trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 p-6 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      <div className="max-w-md mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-sky-600 font-extrabold">Al-Suhail Driver Portal</p>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Record New Trip</h1>
          </div>
          <a href="/driver" className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-2xl transition">
            Back
          </a>
        </div>

        {/* Trip Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
          
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Customer Name</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" placeholder="e.g. Mr. Ahmed" required />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Customer Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" placeholder="e.g. +971 50 123 4567" required />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Pickup Location</label>
            <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" placeholder="e.g. Dibba Lulu Parking" required />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Destination</label>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" placeholder="e.g. Dubai Airport T3" required />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Trip Fare (AED)</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" placeholder="e.g. 200.00" required />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Trip Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm" required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold p-4 rounded-2xl text-sm shadow-lg shadow-sky-600/25 transition-all mt-2">
            {loading ? 'Saving Trip...' : 'Submit Trip Record'}
          </button>

        </form>

      </div>

      <div className="mt-8 text-center text-xs text-slate-400 font-medium">
        Al-Suhail Fleet Management System v2.0
      </div>
    </div>
  );
}