// components/dashboard/StatsOverview.jsx
'use client';

import React, { memo, useState } from 'react';
import { formatCurrency } from '@/lib/helpers';
import { calculatePayoutStats } from '@/lib/payouts';

function StatsOverview({ trips = [], currentUser = null }) {
  const [viewMode, setViewMode] = useState('payout'); // 'payout' | 'all_time'

  const stats = calculatePayoutStats(trips, currentUser);
  const {
    fridayInfo,
    cycleTripsCount,
    cycleGrossFare,
    cycleTotalCosts,
    cycleNetPool,
    driverPayout,
    driverSplitShare,
    driverTripsCount,
    driverReimbursement,
    cancelledPausedCount,
    allTimeCompletedCount,
    allTimeNet,
    tmhCount,
    chauffeurCount,
    totalTripsCount
  } = stats;

  const driverName = currentUser?.name || currentUser?.username || 'Driver';

  return (
    <section className="my-5 sm:my-6 flex flex-col gap-3">
      {/* 1. Cycle Header & Perspective Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-300 font-bold shadow-sm">
            <span>📅</span>
            <span>Next Payout Cycle:</span>
            <span className="font-mono text-white ml-0.5">{fridayInfo.cycleLabel}</span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-[11px] ${
            fridayInfo.isPayoutToday
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
              : fridayInfo.daysUntil === 1
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-white/5 text-slate-300 border border-white/10'
          }`}>
            <span>
              {fridayInfo.isPayoutToday
                ? '🎉 Payout Today!'
                : fridayInfo.daysUntil === 1
                ? '⏰ Payout Tomorrow'
                : `⏳ In ${fridayInfo.daysUntil} days (${fridayInfo.fridayLabel})`}
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('payout')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'payout'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📅 Friday Payout
          </button>
          <button
            type="button"
            onClick={() => setViewMode('all_time')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'all_time'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 All-Time
          </button>
        </div>
      </div>

      {/* 2. Responsive 4-Card Performance Grid */}
      {viewMode === 'payout' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 animate-fade-in">
          
          {/* Card 1: Next Friday Payout Date */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 hover:border-indigo-400/50 hover:bg-indigo-500/15 transition-all shadow-sm shadow-indigo-500/5 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] sm:text-xs text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>📅</span>
                <span>Next Payout</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                {fridayInfo.isPayoutToday ? 'Today' : `In ${fridayInfo.daysUntil}d`}
              </span>
            </div>
            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight block">
                {fridayInfo.fridayLabel}
              </span>
              <span className="text-[11px] text-indigo-200/80 font-mono">
                {fridayInfo.fullFridayDate}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-white/5 truncate">
              Weekly driver payroll cutoff
            </div>
          </div>

          {/* Card 2: Total Friday Payout Pool */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 hover:border-emerald-400/50 hover:bg-emerald-500/15 transition-all shadow-sm shadow-emerald-500/5 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] sm:text-xs text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>💰</span>
                <span>Friday Pool</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                Net Disbursal
              </span>
            </div>
            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight block">
                {formatCurrency(cycleNetPool)}
              </span>
              <span className="text-[11px] text-emerald-200/80 font-mono">
                Gross: {formatCurrency(cycleGrossFare)}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-white/5 truncate">
              {cycleTotalCosts > 0 ? `After R${cycleTotalCosts} extra costs` : '0 deductions this cycle'}
            </div>
          </div>

          {/* Card 3: Qualifying Completed Trips */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 hover:border-amber-400/50 hover:bg-amber-500/15 transition-all shadow-sm shadow-amber-500/5 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] sm:text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>🚗</span>
                <span>Qualifying</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30">
                Cycle Trips
              </span>
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight block">
                {cycleTripsCount}
              </span>
              <span className="text-[11px] text-amber-200/80 font-medium">
                Completed bookings
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-white/5 truncate">
              {cancelledPausedCount > 0 ? `${cancelledPausedCount} paused/cancelled excluded` : '100% completion in cycle'}
            </div>
          </div>

          {/* Card 4: Your Estimated Friday Payout */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 hover:border-cyan-400/50 hover:bg-cyan-500/15 transition-all shadow-sm shadow-cyan-500/5 group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] sm:text-xs text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>👤</span>
                <span>Your Payout</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
                {driverTripsCount} {driverTripsCount === 1 ? 'trip' : 'trips'}
              </span>
            </div>
            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-cyan-300 tracking-tight block">
                {currentUser ? formatCurrency(driverPayout) : formatCurrency(cycleNetPool)}
              </span>
              <span className="text-[11px] text-cyan-200/80 font-medium">
                {currentUser ? `${driverName}'s bank total` : 'Fleet Net Pool'}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-white/5 truncate">
              {driverReimbursement > 0
                ? `Split: ${formatCurrency(driverSplitShare)} + Fuel: ${formatCurrency(driverReimbursement)}`
                : driverTripsCount > 0
                ? '50/50 Driver split share'
                : 'No trips assigned this cycle'}
            </div>
          </div>

        </div>
      ) : (
        /* All-Time Historical Overview */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 animate-fade-in">
          {/* 1. All Trips */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-slate-500/50 transition-all shadow-sm">
            <span className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
              All Trips Logged
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {totalTripsCount}
            </span>
            <div className="text-[10px] text-slate-500 mt-1 pt-1.5 border-t border-white/5">
              {allTimeCompletedCount} completed all time
            </div>
          </div>

          {/* 2. Take Me Home */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 hover:border-amber-400/50 transition-all shadow-sm">
            <span className="text-[11px] sm:text-xs text-amber-300 font-bold uppercase tracking-wider mb-1">
              Take Me Home
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              {tmhCount}
            </span>
            <div className="text-[10px] text-amber-400/75 mt-1 pt-1.5 border-t border-white/5">
              Dual-driver escort trips
            </div>
          </div>

          {/* 3. Chauffeur */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 hover:border-cyan-400/50 transition-all shadow-sm">
            <span className="text-[11px] sm:text-xs text-cyan-300 font-bold uppercase tracking-wider mb-1">
              Chauffeur
            </span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight">
              {chauffeurCount}
            </span>
            <div className="text-[10px] text-cyan-400/75 mt-1 pt-1.5 border-t border-white/5">
              Single-driver fleet trips
            </div>
          </div>

          {/* 4. Total Net Revenue */}
          <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 hover:border-emerald-400/50 transition-all shadow-sm">
            <span className="text-[11px] sm:text-xs text-emerald-300 font-bold uppercase tracking-wider mb-1">
              All-Time Fares
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight">
              {formatCurrency(allTimeNet)}
            </span>
            <div className="text-[10px] text-emerald-400/75 mt-1 pt-1.5 border-t border-white/5">
              Cumulative driver distributions
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(StatsOverview);
