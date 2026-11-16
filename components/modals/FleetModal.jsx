// components/modals/FleetModal.jsx
'use client';

import React, { useState } from 'react';

export default function FleetModal({
  isOpen,
  onClose,
  cars = [],
  onAddCar,
  onDeleteCar
}) {
  const [carName, setCarName] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [carColor, setCarColor] = useState('White');
  const [carOdo, setCarOdo] = useState('');
  const [carFuel, setCarFuel] = useState('95');
  const [adding, setAdding] = useState(false);

  if (!isOpen) return null;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    await onAddCar({
      name: carName,
      plate: carPlate,
      color: carColor,
      odometerKm: parseFloat(carOdo) || 0,
      fuelPercent: parseInt(carFuel) || 95
    });
    setCarName('');
    setCarPlate('');
    setCarOdo('');
    setAdding(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] my-auto max-h-[calc(100dvh-2.5rem)] flex flex-col bg-slate-900 border border-white/15 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-slate-900/98 backdrop-blur-md px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-white">Fleet Vehicles Management</h2>
            <small className="text-xs text-amber-400 font-semibold">VW Polo, Ford Fiesta, Hyundai i20 Rotation</small>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-all text-sm font-bold"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 flex flex-col gap-5">
          {/* Active Fleet List */}
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              ACTIVE ESCORT / CHAUFFEUR FLEET ({cars.length})
            </span>
            <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
              {cars.map(c => (
                <div
                  key={c._id || c.id}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex flex-col">
                    <strong className="text-sm font-bold text-white">{c.name}</strong>
                    <span className="text-xs text-amber-400 font-mono font-bold">{c.plate}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {c.color} • {c.fuelPercent || 90}% Fuel • {c.odometerKm || 35000} km
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-xs px-2.5 py-1.5 rounded-lg text-xs hover:scale-105 active:scale-95 transition-all"
                    onClick={() => onDeleteCar(c._id || c.id)}
                    title="Remove vehicle from fleet"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Vehicle Form */}
          <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
            <span className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
              + ADD NEW VEHICLE TO FLEET
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VW Polo TSI"
                  value={carName}
                  onChange={e => setCarName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Registration Plate *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CA 123-456"
                  value={carPlate}
                  onChange={e => setCarPlate(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Color</label>
                <input
                  type="text"
                  placeholder="White"
                  value={carColor}
                  onChange={e => setCarColor(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Odometer (km)</label>
                <input
                  type="number"
                  placeholder="35000"
                  value={carOdo}
                  onChange={e => setCarOdo(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Fuel (%)</label>
                <input
                  type="number"
                  placeholder="95"
                  value={carFuel}
                  onChange={e => setCarFuel(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="mt-1 w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition-all active:scale-[0.98] shadow-md shadow-cyan-500/20"
            >
              {adding ? 'Registering...' : '+ Add to Active Fleet'}
            </button>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-30 bg-slate-900/98 backdrop-blur-md px-5 py-3.5 border-t border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            className="btn btn-secondary py-2.5 px-6 rounded-xl text-xs font-bold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
