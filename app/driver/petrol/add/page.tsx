'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddPetrolPage() {
  const [amount, setAmount] = useState('');
  const [liters, setLiters] = useState('');
  const [receiptImage, setReceiptImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [driverId, setDriverId] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setDriverId(user.driverId);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];

    const res = await fetch('/api/petrol', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverId,
        amount,
        liters,
        receiptImage,
        date: today,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert('Petrol expense logged successfully!');
      router.push('/driver');
    } else {
      alert(data.error || 'Failed to save petrol expense');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Log Petrol Expense</h1>
        <a href="/driver" className="text-sm font-semibold text-blue-600">Back</a>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Total Amount (AED)</label>
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="e.g. 120.00" required />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Liters Pumped</label>
          <input type="number" step="0.01" value={liters} onChange={(e) => setLiters(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="e.g. 40" required />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Upload Receipt Photo</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-3 border rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
          {receiptImage && <p className="text-xs text-emerald-600 font-semibold mt-2">✓ Receipt image attached successfully</p>}
        </div>

        <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition">
          {loading ? 'Saving...' : 'Submit Receipt'}
        </button>
      </form>
    </div>
  );
}