// components/dashboard/StatsOverview.jsx
import React, { memo } from 'react';
import { formatCurrency } from '../../lib/helpers';

function StatsOverview({ trips = [] }) {
  const totalTrips = trips.length;
  const takeMeHomeCount = trips.filter(t => t.type === 'take_me_home').length;
  const chauffeurCount = trips.filter(t => t.type === 'chauffeur').length;
  const totalEarnings = trips.reduce((acc, t) => acc + (parseFloat(t.fare) || 0), 0);

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 my-5 sm:my-6">
      {/* 1. All Trips */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-white/10 text-center hover:border-slate-500/50 hover:bg-slate-900/90 transition-all shadow-sm">
        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {totalTrips}
        </span>
        <span className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
          All Service Trips
        </span>
      </div>

      {/* 2. Take Me Home */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-center hover:border-amber-400/50 hover:bg-amber-500/15 transition-all shadow-sm shadow-amber-500/5">
        <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
          {takeMeHomeCount}
        </span>
        <span className="text-[11px] sm:text-xs text-amber-200/90 font-bold mt-1.5 flex flex-col items-center">
          <span>Take Me Home</span>
          <small className="text-[10px] text-amber-400/75 font-normal">(2 Drivers)</small>
        </span>
      </div>

      {/* 3. Chauffeur */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-center hover:border-cyan-400/50 hover:bg-cyan-500/15 transition-all shadow-sm shadow-cyan-500/5">
        <span className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight">
          {chauffeurCount}
        </span>
        <span className="text-[11px] sm:text-xs text-cyan-200/90 font-bold mt-1.5 flex flex-col items-center">
          <span>Chauffeur</span>
          <small className="text-[10px] text-cyan-400/75 font-normal">(1 Driver)</small>
        </span>
      </div>

      {/* 4. Total Revenue */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center hover:border-emerald-400/50 hover:bg-emerald-500/15 transition-all shadow-sm shadow-emerald-500/5">
        <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight">
          {formatCurrency(totalEarnings)}
        </span>
        <span className="text-[11px] sm:text-xs text-emerald-200/90 font-bold uppercase tracking-wider mt-1.5">
          Total Fares
        </span>
      </div>
    </section>
  );
}

export default memo(StatsOverview);
