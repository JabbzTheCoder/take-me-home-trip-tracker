// components/dashboard/TripCard.jsx
import React from 'react';
import { formatCurrency } from '../../lib/helpers';
import StatusBadge from '../ui/StatusBadge';
import ServiceBadge from '../ui/ServiceBadge';

export default function TripCard({
  trip,
  onSelect,
  onPrintVoucher,
  onToggleStatus
}) {
  const isTakeMeHome = trip.type === 'take_me_home';
  const isDone = trip.status === 'completed';

  return (
    <article
      className={`rounded-2xl p-5 flex flex-col gap-3.5 transition-all duration-200 cursor-pointer relative overflow-hidden group select-none border backdrop-blur-xl ${
        isDone
          ? 'bg-slate-900/70 border-white/10 hover:border-emerald-500/40 hover:bg-slate-900/90 shadow-sm'
          : 'bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-amber-950/20 border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-amber-500/5'
      } hover:-translate-y-0.5 active:scale-[0.985]`}
      onClick={() => onSelect(trip)}
    >
      {/* 1. Header Row: Service Badge, Status Badge, Time */}
      <div className="flex items-center justify-between gap-2">
        <ServiceBadge type={trip.type} />

        <div className="flex items-center gap-2">
          <StatusBadge status={trip.status} />
          <span className="font-mono text-xs text-slate-400 font-semibold">
            {trip.time}
          </span>
        </div>
      </div>

      {/* 2. Client & Fare Row */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex flex-col min-w-0">
          <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors tracking-tight truncate">
            {trip.clientName}
          </h3>
          <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
            {isTakeMeHome && trip.clientCar ? (
              <span className="text-amber-300/90 font-medium truncate">Client Car: {trip.clientCar}</span>
            ) : trip.car ? (
              <span className="text-cyan-300/90 font-medium truncate">Fleet Car: {trip.car}</span>
            ) : (
              <span className="text-slate-500">Private Booking</span>
            )}
          </span>
        </div>
        <div className="text-xl font-black font-mono text-emerald-400 shrink-0">
          {formatCurrency(trip.fare)}
        </div>
      </div>

      {/* 3. Decluttered Route Flow (Vertical Minimalist Timeline) */}
      <div className="flex flex-col gap-1.5 py-1 text-xs">
        <div className="flex items-start gap-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]"></span>
          <span className="truncate font-medium text-slate-200">{trip.pickup}</span>
        </div>
        <div className="w-0.5 h-2.5 bg-white/15 ml-[3.5px] -my-0.5"></div>
        <div className="flex items-start gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.6)]"></span>
          <span className="truncate font-medium text-slate-200">{trip.dropoff}</span>
        </div>
      </div>

      {/* 4. Desktop-Enhanced Details: Escort Vehicle, Phone, Notes */}
      <div className="hidden sm:flex flex-col gap-2 text-xs text-slate-300 pt-1">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {isTakeMeHome && trip.chaseCar && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-slate-300">
              <span className="text-amber-300 font-bold">Escort Chase:</span>
              <span className="font-mono text-white">{trip.chaseCar}</span>
            </span>
          )}
          {trip.clientPhone && (
            <a
              href={`tel:${trip.clientPhone}`}
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
            >
              <span>📞 {trip.clientPhone}</span>
            </a>
          )}
        </div>

        {trip.notes && (
          <p className="text-xs text-slate-400 italic line-clamp-1 bg-white/[0.02] px-2.5 py-1.5 rounded-lg border border-white/5">
            "{trip.notes}"
          </p>
        )}
      </div>

      {/* 5. Footer: Assigned Drivers & Quick Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs mt-auto">
        <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[65%] sm:max-w-[55%]">
          <span className="text-amber-400 text-xs shrink-0">👤</span>
          <span className="truncate font-medium text-slate-300">
            {isTakeMeHome
              ? `${trip.clientDriverName || 'Lead'} & ${trip.chaseDriverName || 'Chase'}`
              : `${trip.driverName || 'Driver'}`}
          </span>
        </div>

        {/* Quick Action buttons on PC / Details hint on Mobile */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-bold text-slate-200 transition-colors"
              onClick={() => onPrintVoucher(trip)}
              title="Print Official PDF Voucher"
            >
              <span>🖨️ Voucher</span>
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                isDone
                  ? 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
              }`}
              onClick={() => onToggleStatus(trip)}
              title={isDone ? 'Reopen Trip' : 'Mark Completed'}
            >
              <span>{isDone ? 'Reopen' : '✓ Done'}</span>
            </button>
          </div>

          <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all">
            Details ›
          </span>
        </div>
      </div>
    </article>
  );
}
