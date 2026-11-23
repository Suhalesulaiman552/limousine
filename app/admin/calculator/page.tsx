'use client';

import { useState } from 'react';

export default function CalculatorPage() {
  const [distance, setDistance] = useState<number | ''>('');
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(10); // km per liter default
  const [petrolPrice, setPetrolPrice] = useState<number>(2.92); // UAE Special 95 price benchmark
  const [markupPercent, setMarkupPercent] = useState<number>(30); // profit margin

  // Calculations
  const calculatedDistance = Number(distance) || 0;
  const litersNeeded = calculatedDistance > 0 ? calculatedDistance / fuelEfficiency : 0;
  const fuelCost = litersNeeded * petrolPrice;
  const markupAmount = (fuelCost * markupPercent) / 100;
  const totalFare = fuelCost + markupAmount;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Lumina 1 Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 text-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.25)] border border-cyan-300/40">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[70px] pointer-events-none" />
        <div className="relative z-10">
          <span className="bg-white/20 border border-white/30 text-white text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-[0.15em] backdrop-blur-md">
            Financial & Operations Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-light mt-3 tracking-tight text-white">Trip Fare & Fuel Calculator</h2>
          <p className="text-sky-100 text-xs mt-1 max-w-sm font-light leading-relaxed opacity-90">
            Calculate accurate trip fuel consumption, costs, and recommended fare estimates using live parameters under Lumina 1.
          </p>
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Parameters Form */}
        <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-6 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)] space-y-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-[0.15em] mb-4">Parameters</h3>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Trip Distance (KM)
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 120"
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Vehicle Efficiency (KM / Liter)
            </label>
            <input
              type="number"
              value={fuelEfficiency}
              onChange={(e) => setFuelEfficiency(Number(e.target.value))}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Petrol Price (AED per Liter)
            </label>
            <input
              type="number"
              step="0.01"
              value={petrolPrice}
              onChange={(e) => setPetrolPrice(Number(e.target.value))}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-1">
              Profit Margin / Markup (%)
            </label>
            <input
              type="number"
              value={markupPercent}
              onChange={(e) => setMarkupPercent(Number(e.target.value))}
              className="w-full bg-white/80 border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>

        {/* Results Summary Card */}
        <div className="bg-white/50 backdrop-blur-xl border border-sky-200/80 p-6 rounded-2xl shadow-[0_4px_24px_0_rgba(2,132,199,0.06)] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-[0.15em] mb-4">Estimated Breakdown</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-sky-100">
                <span className="text-xs text-slate-600">Fuel Required:</span>
                <span className="text-xs font-medium text-slate-900">{litersNeeded.toFixed(2)} Liters</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-sky-100">
                <span className="text-xs text-slate-600">Estimated Fuel Cost:</span>
                <span className="text-xs font-medium text-cyan-700">AED {fuelCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-sky-100">
                <span className="text-xs text-slate-600">Markup ({markupPercent}%):</span>
                <span className="text-xs font-medium text-slate-900">AED {markupAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-sky-200/60">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Recommended Fare:</span>
              <span className="text-2xl sm:text-3xl font-light text-cyan-600">
                AED {totalFare.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}