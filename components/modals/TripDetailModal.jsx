// components/modals/TripDetailModal.jsx
'use client';

import React, { useState } from 'react';
import { formatCurrency } from '../../lib/helpers';
import StatusBadge from '../ui/StatusBadge';
import ServiceBadge from '../ui/ServiceBadge';
import { calculateTripSplits, EXTRA_COST_CATEGORIES } from '../../lib/splits';

export default function TripDetailModal({
  trip,
  currentUser,
  onClose,
  onPrintInvoice,
  onToggleStatus,
  onDeferTrip,
  onSaveNotes,
  onSaveExtraCosts,
  onSaveSplits
}) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(trip?.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  // Deferral State
  const [showDeferPrompt, setShowDeferPrompt] = useState(false);
  const [deferReason, setDeferReason] = useState('');
  const [deferring, setDeferring] = useState(false);

  // Extra Costs State
  const [showAddCostForm, setShowAddCostForm] = useState(false);
  const [costCategory, setCostCategory] = useState('fuel');
  const [costAmount, setCostAmount] = useState('');
  const [costDescription, setCostDescription] = useState('');
  const [costPaidBy, setCostPaidBy] = useState('');
  const [savingCost, setSavingCost] = useState(false);

  // Split Adjustment State
  const [isEditingSplit, setIsEditingSplit] = useState(false);
  const [splitType, setSplitType] = useState(trip?.splits?.splitType || 'equal_50_50');
  const [customLeadAmount, setCustomLeadAmount] = useState(trip?.splits?.leadDriverAmount || '');
  const [customChaseAmount, setCustomChaseAmount] = useState(trip?.splits?.chaseDriverAmount || '');
  const [savingSplit, setSavingSplit] = useState(false);

  if (!trip) return null;

  const isTakeMeHome = trip.type === 'take_me_home';
  const isDone = trip.status === 'completed';
  const isDeferred = trip.status === 'deferred';

  // Calculate live financial splits and expense breakdowns
  const splitInfo = calculateTripSplits(trip);

  // Check if current logged-in driver is attached to this trip
  const currentUserName = (currentUser?.name || '').trim().toLowerCase();
  const isAttached = isTakeMeHome
    ? (
        (trip.clientDriverName && trip.clientDriverName.trim().toLowerCase() === currentUserName) ||
        (trip.chaseDriverName && trip.chaseDriverName.trim().toLowerCase() === currentUserName)
      )
    : (
        trip.driverName && trip.driverName.trim().toLowerCase() === currentUserName
      );

  const assignedNames = isTakeMeHome
    ? `${trip.clientDriverName || 'Lead Chauffeur'} & ${trip.chaseDriverName || 'Chase Driver'}`
    : `${trip.driverName || 'Chauffeur'}`;

  // Default payer for extra costs
  const defaultPayer = trip.chaseDriverName || trip.clientDriverName || trip.driverName || currentUser?.name || 'Driver';

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await onSaveNotes(trip._id || trip.id, notesText);
    setSavingNotes(false);
    setIsEditingNotes(false);
  };

  const handleConfirmDefer = async (reasonToSubmit) => {
    const finalReason = reasonToSubmit || deferReason || 'Client requested postponement';
    setDeferring(true);
    await onDeferTrip(trip, finalReason);
    setDeferring(false);
    setShowDeferPrompt(false);
  };

  const handleAddExtraCost = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(costAmount);
    if (!amountNum || amountNum <= 0) return;

    setSavingCost(true);
    const newCost = {
      id: `cost-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: costCategory,
      amount: amountNum,
      description: costDescription.trim() || `${costCategory.toUpperCase()} expense`,
      paidBy: costPaidBy || defaultPayer,
      createdAt: new Date().toISOString()
    };

    const currentCosts = Array.isArray(trip.extraCosts) ? [...trip.extraCosts] : [];
    const updatedCosts = [...currentCosts, newCost];

    if (onSaveExtraCosts) {
      await onSaveExtraCosts(trip._id || trip.id, updatedCosts);
    }
    setSavingCost(false);
    setShowAddCostForm(false);
    setCostAmount('');
    setCostDescription('');
  };

  const handleDeleteExtraCost = async (costId) => {
    if (!confirm('Are you sure you want to remove this expense?')) return;
    const currentCosts = Array.isArray(trip.extraCosts) ? trip.extraCosts : [];
    const updatedCosts = currentCosts.filter(c => c.id !== costId);
    if (onSaveExtraCosts) {
      await onSaveExtraCosts(trip._id || trip.id, updatedCosts);
    }
  };

  const handleSaveSplitSettings = async () => {
    setSavingSplit(true);
    const newSplits = {
      splitType,
      leadDriverAmount: splitType === 'custom_amount' ? (parseFloat(customLeadAmount) || 0) : splitInfo.leadDriverShare,
      chaseDriverAmount: splitType === 'custom_amount' ? (parseFloat(customChaseAmount) || 0) : splitInfo.chaseDriverShare,
      companyAmount: splitInfo.companyShare,
      leadDriverPercent: splitType === 'equal_50_50' ? 50 : 50,
      chaseDriverPercent: splitType === 'equal_50_50' ? 50 : 50,
    };
    if (onSaveSplits) {
      await onSaveSplits(trip._id || trip.id, newSplits);
    }
    setSavingSplit(false);
    setIsEditingSplit(false);
  };

  const deferPresets = [
    'Client Postponed',
    'Client Cancelled',
    'Client No-Show / Unreachable',
    'Vehicle Issue / Maintenance'
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] md:max-w-3xl lg:max-w-4xl my-auto max-h-[calc(100dvh-2.5rem)] flex flex-col bg-slate-900 border border-white/15 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* 1. STICKY TOP NAVIGATION */}
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
            <StatusBadge status={trip.status} showLock={isDone} />
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-all text-sm font-bold"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. SCROLLABLE BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7 space-y-5">
          
          {/* Driver Permission Alert Banner */}
          {!isAttached ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3">
              <span className="text-xl shrink-0">👁️</span>
              <div className="leading-relaxed">
                <strong className="text-white block font-bold">Read-Only View:</strong>
                You are not an assigned driver on this trip ({assignedNames}). Other drivers can view trip details, but only attached drivers can edit notes, record extra costs, or manage splits.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold">
                <span>✓</span>
                <span>Attached driver: Authorized to record costs, view splits, and add trip instructions.</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">
                Attached Driver
              </span>
            </div>
          )}

          {/* Status Lock Indicator if Completed */}
          {isDone && (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-emerald-500/30 text-xs flex items-center gap-2.5 text-slate-300">
              <span className="text-base">🔒</span>
              <div className="leading-tight">
                <strong className="text-emerald-300">Status Locked (Completed):</strong> As per operational rules, once a trip is marked Completed, its status is finalized and cannot be modified.
              </div>
            </div>
          )}

          {/* Deferral Details Notice if trip is Deferred */}
          {isDeferred && (
            <div className="p-4 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-purple-300 flex items-center gap-1.5">
                  <span>⏸</span>
                  <span>Trip Deferred</span>
                </span>
                {trip.deferredAt && (
                  <span className="font-mono text-[11px] text-purple-300/80">
                    {new Date(trip.deferredAt).toLocaleDateString()} {new Date(trip.deferredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-white font-medium">
                Reason: <em>"{trip.deferReason || 'No specific reason provided'}"</em>
              </p>
              {trip.deferredBy && (
                <span className="text-[11px] text-purple-300/75 block">
                  Deferred by: <strong>{trip.deferredBy}</strong>
                </span>
              )}
            </div>
          )}

          {/* Main 2-Column Responsive Layout */}
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

                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {trip.clientName}
                  </h2>
                  <span className="text-xs font-mono text-slate-400 font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    Inv #{trip.invoiceNumber || '371'}
                  </span>
                </div>

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

              {/* Transit Timeline / Multi-Stop Route */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  TRIP ROUTE & TRANSIT FLOW
                </span>

                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400 mt-1 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.7)] flex items-center justify-center text-[8px] font-black text-slate-950">
                      A
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Pickup Address / Venue</span>
                      <strong className="text-sm text-white font-medium">{trip.pickup}</strong>
                    </div>
                  </div>

                  {/* Optional Split Stops */}
                  {Array.isArray(trip.splitStops) && trip.splitStops.map((stop, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <div className="w-0.5 h-4 bg-white/15 ml-[6.5px]"></div>
                      <div className="flex items-start gap-3">
                        <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 mt-1 shrink-0 flex items-center justify-center text-[8px] font-black text-slate-950">
                          {sIdx + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[11px] text-cyan-300 font-bold uppercase">Intermediate Split Drop #{sIdx + 1}</span>
                          <strong className="text-sm text-slate-200 font-medium">{stop}</strong>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}

                  <div className="w-0.5 h-6 bg-white/15 ml-[6.5px]"></div>

                  <div className="flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 mt-1 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.7)] flex items-center justify-center text-[8px] font-black text-slate-950">
                      B
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Final Destination</span>
                      <strong className="text-sm text-white font-medium">{trip.dropoff}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Driver Roster, Notes, Fare */}
            <div className="flex flex-col gap-4">
              
              {/* Roster & Assigned Fleet */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  ASSIGNED CHAUFFEUR ROSTER
                </span>

                {isTakeMeHome ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 bg-amber-400 text-slate-950 shadow-sm">
                        1
                      </div>
                      <div className="flex flex-col min-w-0">
                        <strong className="text-sm text-white truncate font-bold">{trip.clientDriverName || 'Lead Chauffeur'}</strong>
                        <span className="text-[11px] text-slate-400">Drove Client's Vehicle Home</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 bg-cyan-400 text-slate-950 shadow-sm">
                        2
                      </div>
                      <div className="flex flex-col min-w-0">
                        <strong className="text-sm text-white truncate font-bold">{trip.chaseDriverName || 'Chase Driver'}</strong>
                        <span className="text-[11px] text-slate-400">Drove Escort Chase Car</span>
                        <small className="text-xs text-amber-300 font-mono mt-0.5 truncate">{trip.chaseCar || 'Fleet Escort'}</small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 bg-cyan-400 text-slate-950 shadow-sm">
                      🎩
                    </div>
                    <div className="flex flex-col min-w-0">
                      <strong className="text-sm text-white font-bold">{trip.driverName || 'Designated Driver'}</strong>
                      <span className="text-[11px] text-slate-400">Solo Chauffeur Transit</span>
                      <small className="text-xs text-amber-300 font-mono mt-0.5">Fleet: {trip.car || 'Company Fleet'}</small>
                    </div>
                  </div>
                )}
              </div>

              {/* Trip Notes Section */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    📝 TRIP NOTES & INSTRUCTIONS
                  </span>
                  {isAttached && !isEditingNotes && (
                    <button
                      type="button"
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
                      onClick={() => {
                        setNotesText(trip.notes || '');
                        setIsEditingNotes(true);
                      }}
                    >
                      Edit Notes
                    </button>
                  )}
                </div>

                {!isEditingNotes ? (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {trip.notes && trip.notes.trim() ? (
                      trip.notes
                    ) : (
                      <em className="text-slate-500">No special instructions recorded for this trip.</em>
                    )}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 mt-1">
                    <textarea
                      className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
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
                  Total Tax Invoice Rate
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {formatCurrency(trip.fare)}
                </span>
              </div>
            </div>

          </div>

          {/* ================================================================= */}
          {/* 3. EXTRA COSTS & EXPENSES SECTION (FUEL, TOLLS, CAR WASH, ETC.) */}
          {/* ================================================================= */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>⛽</span>
                  <span>Extra Trip Costs & Expenses</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record fuel, tolls, or car wash costs. Extra costs are deducted from the gross fare to calculate net driver splits.
                </p>
              </div>

              {isAttached && !showAddCostForm && (
                <button
                  type="button"
                  onClick={() => setShowAddCostForm(true)}
                  className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 border-amber-500/30 font-bold"
                >
                  <span>＋</span>
                  <span>Add Cost</span>
                </button>
              )}
            </div>

            {/* Inline Add Cost Form */}
            {showAddCostForm && (
              <form onSubmit={handleAddExtraCost} className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3 animate-slide-down">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Record New Extra Expense</span>
                  <button
                    type="button"
                    onClick={() => setShowAddCostForm(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Category</label>
                    <select
                      value={costCategory}
                      onChange={e => setCostCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {EXTRA_COST_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Amount (R)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="e.g. 150.00"
                      value={costAmount}
                      onChange={e => setCostAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Paid By (Reimbursed To)</label>
                    <select
                      value={costPaidBy || defaultPayer}
                      onChange={e => setCostPaidBy(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {isTakeMeHome ? (
                        <>
                          <option value={trip.clientDriverName || 'Lead Driver'}>
                            Lead: {trip.clientDriverName || 'Driver 1'}
                          </option>
                          <option value={trip.chaseDriverName || 'Chase Driver'}>
                            Chase: {trip.chaseDriverName || 'Driver 2'}
                          </option>
                        </>
                      ) : (
                        <option value={trip.driverName || 'Chauffeur'}>
                          Chauffeur: {trip.driverName || 'Driver'}
                        </option>
                      )}
                      <option value="Company">Company Card / Account</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Description / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Engen Garage Bryanston - 15L fuel"
                    value={costDescription}
                    onChange={e => setCostDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCostForm(false)}
                    className="btn btn-secondary btn-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCost || !costAmount}
                    className="btn btn-gold btn-xs font-bold"
                  >
                    {savingCost ? 'Saving...' : 'Save Cost'}
                  </button>
                </div>
              </form>
            )}

            {/* List of Extra Costs */}
            {Array.isArray(trip.extraCosts) && trip.extraCosts.length > 0 ? (
              <div className="space-y-2">
                {trip.extraCosts.map((cost) => {
                  const catConfig = EXTRA_COST_CATEGORIES.find(c => c.id === cost.category) || EXTRA_COST_CATEGORIES[0];
                  return (
                    <div
                      key={cost.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{catConfig.icon}</span>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{cost.description || catConfig.label}</span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                              {catConfig.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Paid by: <strong className="text-amber-300 font-semibold">{cost.paidBy}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-mono font-bold text-rose-400">
                          -{formatCurrency(cost.amount)}
                        </span>
                        {isAttached && (
                          <button
                            type="button"
                            onClick={() => handleDeleteExtraCost(cost.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove cost"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-2 px-1 text-xs">
                  <span className="text-slate-400 font-semibold">Total Extra Costs Deducted:</span>
                  <span className="font-mono font-bold text-rose-400">
                    -{formatCurrency(splitInfo.totalExtraCosts)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-slate-400">
                No extra expenses recorded for this trip (e.g. fuel or tolls).
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* 4. DRIVER FARE SPLITS FUNCTIONALITY */}
          {/* ================================================================= */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>👥</span>
                  <span>Driver Fare Split & Payout Breakdown</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculation of driver shares from Net Fare after extra costs, plus direct expense reimbursements.
                </p>
              </div>

              {isTakeMeHome && isAttached && !isEditingSplit && (
                <button
                  type="button"
                  onClick={() => setIsEditingSplit(true)}
                  className="btn btn-secondary btn-sm text-xs font-bold text-amber-300"
                >
                  ⚙️ Adjust Split
                </button>
              )}
            </div>

            {/* Split Settings Form */}
            {isEditingSplit && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3 animate-slide-down">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Customize Driver Split Ratio</span>
                  <button type="button" onClick={() => setIsEditingSplit(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="splitType"
                      checked={splitType === 'equal_50_50'}
                      onChange={() => setSplitType('equal_50_50')}
                      className="text-amber-400 focus:ring-0"
                    />
                    <span>Equal 50 / 50 Split</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="splitType"
                      checked={splitType === 'custom_amount'}
                      onChange={() => setSplitType('custom_amount')}
                      className="text-amber-400 focus:ring-0"
                    />
                    <span>Custom Rand Amounts</span>
                  </label>
                </div>

                {splitType === 'custom_amount' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        {trip.clientDriverName || 'Lead Chauffeur'} Amount (R)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={customLeadAmount}
                        onChange={e => setCustomLeadAmount(e.target.value)}
                        placeholder="e.g. 150.00"
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-2.5 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        {trip.chaseDriverName || 'Chase Driver'} Amount (R)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={customChaseAmount}
                        onChange={e => setCustomChaseAmount(e.target.value)}
                        placeholder="e.g. 150.00"
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-2.5 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setIsEditingSplit(false)} className="btn btn-secondary btn-xs">Cancel</button>
                  <button type="button" onClick={handleSaveSplitSettings} disabled={savingSplit} className="btn btn-gold btn-xs font-bold">
                    {savingSplit ? 'Saving...' : 'Save Split'}
                  </button>
                </div>
              </div>
            )}

            {/* Split Financial Summary Box */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Fare</span>
                <span className="text-sm font-black font-mono text-white">{formatCurrency(splitInfo.grossFare)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Extra Costs</span>
                <span className="text-sm font-black font-mono text-rose-400">-{formatCurrency(splitInfo.totalExtraCosts)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Net Split Pool</span>
                <span className="text-sm font-black font-mono text-emerald-400">{formatCurrency(splitInfo.netFare)}</span>
              </div>
            </div>

            {/* Driver Payout Split Cards */}
            {isTakeMeHome ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Lead Driver Payout */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>👤 Lead Chauffeur</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                      Client Vehicle
                    </span>
                  </div>
                  <div className="text-base font-bold text-white truncate">
                    {trip.clientDriverName || 'Lead Driver'}
                  </div>
                  <div className="space-y-1 text-xs border-t border-white/5 pt-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Fare Split Share:</span>
                      <span className="font-mono text-slate-200">{formatCurrency(splitInfo.leadDriverShare)}</span>
                    </div>
                    {splitInfo.leadReimbursement > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Cost Reimbursement:</span>
                        <span className="font-mono">+{formatCurrency(splitInfo.leadReimbursement)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-white/5">
                      <span className="text-white">Total Payout:</span>
                      <span className="font-mono text-emerald-300 font-black">{formatCurrency(splitInfo.leadFinalPayout)}</span>
                    </div>
                  </div>
                </div>

                {/* Chase Driver Payout */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <span>🚗 Chase Driver</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                      Escort Fleet
                    </span>
                  </div>
                  <div className="text-base font-bold text-white truncate">
                    {trip.chaseDriverName || 'Chase Driver'}
                  </div>
                  <div className="space-y-1 text-xs border-t border-white/5 pt-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Fare Split Share:</span>
                      <span className="font-mono text-slate-200">{formatCurrency(splitInfo.chaseDriverShare)}</span>
                    </div>
                    {splitInfo.chaseReimbursement > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Cost Reimbursement:</span>
                        <span className="font-mono">+{formatCurrency(splitInfo.chaseReimbursement)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-white/5">
                      <span className="text-white">Total Payout:</span>
                      <span className="font-mono text-cyan-300 font-black">{formatCurrency(splitInfo.chaseFinalPayout)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Solo Chauffeur Payout */
              <div className="p-4 rounded-xl bg-white/[0.03] border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <span>🎩 Solo Chauffeur</span>
                  </span>
                  <span className="text-sm font-mono font-black text-emerald-300">
                    Net Payout: {formatCurrency(splitInfo.leadFinalPayout)}
                  </span>
                </div>
                <div className="text-sm text-slate-300 font-semibold">
                  Driver: {trip.driverName || 'Designated Driver'}
                </div>
              </div>
            )}
          </div>

          {/* Inline Deferral Prompt (Only accessible if trip is NOT completed) */}
          {showDeferPrompt && !isDone && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3.5 animate-scale-up">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-purple-300 flex items-center gap-2">
                  <span>⏸</span>
                  <span>Defer Trip & Record Reason</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowDeferPrompt(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕ Close
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                As per audit compliance, trips cannot be permanently deleted. Deferring flags this booking with a statutory explanation and automatically notifies the assigned drivers.
              </p>

              <div className="flex flex-wrap gap-2">
                {deferPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDeferReason(preset)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:border-purple-400 hover:bg-purple-500/20 text-slate-300 hover:text-purple-200 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                value={deferReason}
                onChange={e => setDeferReason(e.target.value)}
                placeholder="Specific deferral reason or client instructions..."
                rows={2}
                className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />

              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/10 hover:bg-white/20"
                  onClick={() => setShowDeferPrompt(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deferring || !deferReason.trim()}
                  onClick={() => handleConfirmDefer()}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition-all shadow-md shadow-purple-600/30"
                >
                  {deferring ? 'Saving...' : 'Confirm Deferral'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 3. STICKY BOTTOM ACTIONS */}
        <div className="sticky bottom-0 z-30 bg-slate-900/98 backdrop-blur-md px-5 py-4 border-t border-white/10 flex flex-col sm:flex-row gap-2.5 shrink-0">
          
          {/* Print Official Tax Invoice Button */}
          <button
            type="button"
            className="btn btn-gold btn-glow flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/25 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            onClick={() => onPrintInvoice(trip)}
          >
            <span>📄</span>
            <span>Tax Invoice / PDF</span>
          </button>

          {/* Attached Driver Actions: Only if deferred can they complete. Completed trips are locked */}
          {isAttached && (
            <div className="flex items-center gap-2">
              {isDeferred && (
                <button
                  type="button"
                  className="btn btn-emerald flex-1 sm:flex-none py-3 px-5 rounded-xl font-bold text-xs active:scale-[0.97] transition-all shrink-0"
                  onClick={() => onToggleStatus(trip, 'completed')}
                >
                  <span>✓ Mark Completed</span>
                </button>
              )}

              {!isDone && !isDeferred && (
                <button
                  type="button"
                  className="btn px-4 py-3 rounded-xl border border-purple-500/30 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-bold text-xs active:scale-[0.95] transition-all shrink-0 flex items-center gap-1.5"
                  onClick={() => setShowDeferPrompt(prev => !prev)}
                  title="Defer Trip (Non-deletable compliance)"
                >
                  <span>⏸ Defer</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
