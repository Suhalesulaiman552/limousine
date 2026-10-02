'use client';

import { useState } from 'react';

export default function AdminCalculatorPage() {
  const [distanceKm, setDistanceKm] = useState('');
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState('3.15'); 
  const [carEfficiency, setCarEfficiency] = useState('10'); 
  const [markupPercent, setMarkupPercent] = useState('30'); 
  const [fareResult, setFareResult] = useState<any>(null);

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

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold text-amber-400 mb-2">Trip Fare & Fuel Calculator</h2>
      <p className="text-slate-400 text-sm mb-6">Estimate route fuel consumption and recommended trip pricing using UAE Special 95 rates.</p>

      <form onSubmit={handleCalculateFare} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Distance (KM)</label>
          <input 
            type="number" 
            step="0.1" 
            value={distanceKm} 
            onChange={e => setDistanceKm(e.target.value)} 
            required 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
            placeholder="e.g. 130"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Fuel Rate (AED/L)</label>
            <input 
              type="number" 
              step="0.01" 
              value={fuelPricePerLitre} 
              onChange={e => setFuelPricePerLitre(e.target.value)} 
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Efficiency (KM/L)</label>
            <input 
              type="number" 
              step="0.1" 
              value={carEfficiency} 
              onChange={e => setCarEfficiency(e.target.value)} 
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Profit Markup (%)</label>
          <input 
            type="number" 
            value={markupPercent} 
            onChange={e => setMarkupPercent(e.target.value)} 
            required 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
          />
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
  );
}