// components/modals/TripDetailModal.jsx
'use client';

import React, { useState } from 'react';
import { formatCurrency } from '../../lib/helpers';
import StatusBadge from '../ui/StatusBadge';
import ServiceBadge from '../ui/ServiceBadge';

export default function TripDetailModal({
  trip,
  onClose,
  onPrintVoucher,
  onToggleStatus,
  onDeleteTrip,
  onSaveNotes
}) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(trip?.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  if (!trip) return null;

  const isTakeMeHome = trip.type === 'take_me_home';
  const isDone = trip.status === 'completed';

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await onSaveNotes(trip._id || trip.id, notesText);
    setSavingNotes(false);
    setIsEditingNotes(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] md:max-w-3xl lg:max-w-4xl my-auto max-h-[calc(100dvh-2.5rem)] flex flex-col bg-slate-900 border border-white/15 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* 1. STICKY TOP NAVIGATION (PINNED - NEVER CUTS OFF) */}
        <div className="sticky top-0 z-30 bg-slate-900/98 backdrop-blur-md px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <button
            type="button"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs sm:text-sm font-bold transition-colors select-none"
            onClick={onClose}
          >
            <span className="text-base">←</span>
            <span>Back to Trips</span>
          </button>

          <div className="flex items-center gap-2.5">
            <StatusBadge status={trip.status} />
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-all text-sm font-bold"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. SCROLLABLE BODY (RESPONSIVE: 1-COLUMN MOBILE, 2-COLUMN PC) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Left Column: Hero & Transit Route */}
            <div className="flex flex-col gap-4">
              {/* Hero Banner */}
              <div className={`p-5 rounded-2xl flex flex-col gap-3 border ${
                isTakeMeHome
                  ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/30 shadow-lg shadow-amber-500/5'
                  : 'bg-gradient-to-br from-cyan-500/15 via-slate-900 to-slate-900 border-cyan-500/30 shadow-lg shadow-cyan-500/5'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono">
                  <ServiceBadge type={trip.type} />
                  <span className="text-slate-400 font-semibold">{trip.date} • {trip.time}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {trip.clientName}
                </h2>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {trip.clientPhone && (
                    <a
                      href={`tel:${trip.clientPhone}`}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <span>📞 Call {trip.clientPhone}</span>
                    </a>
                  )}

                  {isTakeMeHome && trip.clientCar && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs">
                      <span className="text-slate-400">Client Car:</span>
                      <strong>{trip.clientCar}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Route Timeline Box */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  TRANSIT ROUTE
                </span>
                <div className="flex flex-col gap-2 pl-1">
                  <div className="flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded-full mt-1 shrink-0 bg-amber-400 shadow-md shadow-amber-500/50"></span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">PICKUP VENUE</span>
                      <p className="text-sm font-semibold text-white mt-0.5">{trip.pickup}</p>
                    </div>
                  </div>

                  <div className="w-0.5 h-5 bg-white/20 ml-1.5 my-0.5"></div>

                  <div className="flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded-full mt-1 shrink-0 bg-emerald-400 shadow-md shadow-emerald-500/50"></span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">DESTINATION</span>
                      <p className="text-sm font-semibold text-white mt-0.5">{trip.dropoff}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Driver Audit, Notes, Fare */}
            <div className="flex flex-col gap-4">
              {/* Who Done It Section */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    WHO DONE THIS TRIP
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {isTakeMeHome ? '2 Drivers Dispatched' : '1 Driver Dispatched'}
                  </span>
                </div>

                {isTakeMeHome ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-white/5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 bg-amber-400 text-slate-950 shadow-sm">
                        1
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase truncate">Drove Client Car</span>
                        <strong className="text-sm text-white truncate">{trip.clientDriverName || 'Lead Driver'}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-white/5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 bg-cyan-400 text-slate-950 shadow-sm">
                        2
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase truncate">Drove Escort Car</span>
                        <strong className="text-sm text-white truncate">{trip.chaseDriverName || 'Chase Driver'}</strong>
                        <small className="text-xs text-amber-300 font-mono mt-0.5 truncate">{trip.chaseCar || 'Fleet Escort'}</small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-white/5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 bg-cyan-400 text-slate-950 shadow-sm">
                      🎩
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Chauffeur Driver</span>
                      <strong className="text-sm text-white">{trip.driverName || 'Driver'}</strong>
                      <small className="text-xs text-amber-300 font-mono mt-0.5">Fleet: {trip.car || 'Company Fleet'}</small>
                    </div>
                  </div>
                )}
              </div>

              {/* Trip Notes with Live In-Place Edit */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    📝 TRIP NOTES & INSTRUCTIONS
                  </span>
                  <button
                    type="button"
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
                    onClick={() => setIsEditingNotes(prev => !prev)}
                  >
                    {isEditingNotes ? 'Cancel' : 'Edit Notes'}
                  </button>
                </div>

                {!isEditingNotes ? (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {trip.notes && trip.notes.trim() ? (
                      trip.notes
                    ) : (
                      <em className="text-slate-500">No special notes recorded for this trip yet.</em>
                    )}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 mt-1">
                    <textarea
                      className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      rows={3}
                      value={notesText}
                      onChange={e => setNotesText(e.target.value)}
                      placeholder="Enter gate codes, key handover info, etc..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white"
                        onClick={() => setIsEditingNotes(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950"
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                      >
                        {savingNotes ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Agreed Service Fare */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                  Agreed Service Fare
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {formatCurrency(trip.fare)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. STICKY BOTTOM ACTIONS (PINNED - NEVER CUTS OFF) */}
        <div className="sticky bottom-0 z-30 bg-slate-900/98 backdrop-blur-md px-5 py-4 border-t border-white/10 flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            type="button"
            className="btn btn-gold btn-glow flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/25 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            onClick={() => onPrintVoucher(trip)}
          >
            <span>🖨️ Print Official PDF Voucher</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`btn ${isDone ? 'btn-secondary' : 'btn-emerald'} flex-1 sm:flex-none py-3 px-5 rounded-xl font-bold text-xs active:scale-[0.97] transition-all shrink-0`}
              onClick={() => onToggleStatus(trip)}
            >
              <span>{isDone ? 'Mark In Transit' : '✓ Mark Completed'}</span>
            </button>

            <button
              type="button"
              className="btn btn-danger-outline py-3 px-4 rounded-xl flex items-center justify-center text-sm active:scale-[0.95] transition-all shrink-0"
              onClick={() => onDeleteTrip(trip._id || trip.id)}
              title="Delete Trip Record"
            >
              🗑️
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
