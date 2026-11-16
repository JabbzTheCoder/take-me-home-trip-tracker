// components/modals/LogTripModal.jsx
'use client';

import React, { useState } from 'react';

export default function LogTripModal({
  isOpen,
  onClose,
  onSubmit,
  cars = [],
  currentUser
}) {
  const [tripType, setTripType] = useState('take_me_home');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [clientCar, setClientCar] = useState('');
  const [leadDriver, setLeadDriver] = useState(currentUser?.name || 'Jabbz');
  const [chaseDriver, setChaseDriver] = useState('Tebza');
  const [chaseCar, setChaseCar] = useState(cars[0]?.name ? `${cars[0].name} [${cars[0].plate}]` : 'VW Polo [CA 782-991]');
  const [chauffeurDriver, setChauffeurDriver] = useState(currentUser?.name || 'Jabbz');
  const [chauffeurCar, setChauffeurCar] = useState(cars[0]?.name ? `${cars[0].name} [${cars[0].plate}]` : 'VW Polo [CA 782-991]');
  const [tripDate, setTripDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tripTime, setTripTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [tripStatus, setTripStatus] = useState('completed');
  const [fare, setFare] = useState(450);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const driversList = ['Jabbz', 'Tebza', 'Fresh'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const tripData = {
      type: tripType,
      clientName,
      clientPhone,
      pickup,
      dropoff,
      date: tripDate,
      time: tripTime,
      status: tripStatus,
      fare: parseFloat(fare) || 0,
      notes,
      ...(tripType === 'take_me_home'
        ? {
            clientCar,
            clientDriverName: leadDriver,
            chaseDriverName: chaseDriver,
            chaseCar: chaseCar
          }
        : {
            driverName: chauffeurDriver,
            car: chauffeurCar
          })
    };

    await onSubmit(tripData);
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] my-auto max-h-[calc(100dvh-2.5rem)] flex flex-col bg-slate-900 border border-white/15 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-slate-900/98 backdrop-blur-md px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-white">Log New Service Trip</h2>
            <small className="text-xs text-amber-400 font-semibold">Take Me Home or Chauffeur</small>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-all text-sm font-bold"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 flex flex-col gap-4">
          {/* Segmented Service Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-white/10 shrink-0">
            <button
              type="button"
              className={`py-2.5 px-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                tripType === 'take_me_home'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => {
                setTripType('take_me_home');
                setFare(450);
              }}
            >
              <span className="text-xs font-black">🚗 Take Me Home</span>
              <small className={`text-[10px] ${tripType === 'take_me_home' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>(2 Drivers Dispatched)</small>
            </button>

            <button
              type="button"
              className={`py-2.5 px-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                tripType === 'chauffeur'
                  ? 'bg-cyan-400 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => {
                setTripType('chauffeur');
                setFare(550);
              }}
            >
              <span className="text-xs font-black">🎩 Chauffeur</span>
              <small className={`text-[10px] ${tripType === 'chauffeur' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>(1 Driver Dispatched)</small>
            </button>
          </div>

          {/* Service Info Banner */}
          <div className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
            tripType === 'take_me_home'
              ? 'bg-amber-400/10 border border-amber-400/20 text-amber-200'
              : 'bg-cyan-400/10 border border-cyan-400/20 text-cyan-200'
          }`}>
            <span>{tripType === 'take_me_home' ? '💡' : '🎩'}</span>
            <span>
              {tripType === 'take_me_home'
                ? 'Client driven home in their own car. Requires Lead Chauffeur + Chase Escort Vehicle.'
                : 'Direct chauffeur booking using company fleet vehicle.'}
            </span>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Client Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Michael van der Merwe"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Client Contact Phone</label>
              <input
                type="tel"
                placeholder="e.g. 082 123 4567"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Route Fields */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Pickup Address / Venue *</label>
            <input
              type="text"
              required
              placeholder="e.g. The Grillhouse, Rosebank"
              value={pickup}
              onChange={e => setPickup(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Dropoff Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. 14 Sandhurst Dr, Sandton"
              value={dropoff}
              onChange={e => setDropoff(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Conditional Vehicle & Driver Roster */}
          {tripType === 'take_me_home' ? (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                DUAL CHAUFFEUR ROSTER & VEHICLES
              </span>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Client Driven Car *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audi A4 (Silver) [CA 123-456]"
                  value={clientCar}
                  onChange={e => setClientCar(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Driver 1 (Drove Client Car) *</label>
                  <select
                    value={leadDriver}
                    onChange={e => setLeadDriver(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {driversList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Driver 2 (Drove Chase Car) *</label>
                  <select
                    value={chaseDriver}
                    onChange={e => setChaseDriver(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {driversList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Escort Chase Vehicle *</label>
                <select
                  value={chaseCar}
                  onChange={e => setChaseCar(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {cars.map(c => (
                    <option key={c._id || c.id} value={`${c.name} [${c.plate}]`}>
                      {c.name} [{c.plate}]
                    </option>
                  ))}
                  <option value="VW Polo [CA 782-991]">VW Polo [CA 782-991]</option>
                  <option value="Ford Fiesta [GP 882-192]">Ford Fiesta [GP 882-192]</option>
                  <option value="Hyundai i20 [ND 449-012]">Hyundai i20 [ND 449-012]</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                CHAUFFEUR DRIVER & FLEET ASSIGNMENT
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Assigned Chauffeur *</label>
                  <select
                    value={chauffeurDriver}
                    onChange={e => setChauffeurDriver(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {driversList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fleet Vehicle *</label>
                  <select
                    value={chauffeurCar}
                    onChange={e => setChauffeurCar(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {cars.map(c => (
                      <option key={c._id || c.id} value={`${c.name} [${c.plate}]`}>
                        {c.name} [{c.plate}]
                      </option>
                    ))}
                    <option value="VW Polo [CA 782-991]">VW Polo [CA 782-991]</option>
                    <option value="Ford Fiesta [GP 882-192]">Ford Fiesta [GP 882-192]</option>
                    <option value="Hyundai i20 [ND 449-012]">Hyundai i20 [ND 449-012]</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Date, Time, Fare, Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                required
                value={tripDate}
                onChange={e => setTripDate(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Time *</label>
              <input
                type="time"
                required
                value={tripTime}
                onChange={e => setTripTime(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Fare (R) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={fare}
                onChange={e => setFare(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Status *</label>
              <select
                value={tripStatus}
                onChange={e => setTripStatus(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="completed">✓ Completed</option>
                <option value="in_progress">● In Transit</option>
              </select>
            </div>
          </div>

          {/* Trip Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Trip Notes & Instructions</label>
            <textarea
              rows={2}
              placeholder="Gate code, key handover, specific route notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Sticky Actions Bar */}
          <div className="sticky bottom-0 z-20 bg-slate-900/98 backdrop-blur-md pt-3 pb-1 border-t border-white/10 flex gap-2.5 mt-2">
            <button
              type="button"
              className="btn btn-secondary flex-1 py-3 rounded-xl text-xs font-bold"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-gold btn-glow flex-1 py-3 rounded-xl text-xs font-black"
            >
              {submitting ? 'Logging Trip...' : 'Confirm & Log Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
