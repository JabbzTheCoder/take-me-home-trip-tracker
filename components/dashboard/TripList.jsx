// components/dashboard/TripList.jsx
import React, { memo } from 'react';
import TripCard from './TripCard';

function TripList({
  trips = [],
  filter = 'all',
  searchQuery = '',
  currentUser,
  onSelectTrip,
  onPrintVoucher,
  onToggleStatus,
  onOpenLogModal
}) {
  if (trips.length === 0) {
    return (
      <div className="p-8 sm:p-14 rounded-3xl bg-slate-900/60 border border-dashed border-white/15 text-center flex flex-col items-center justify-center gap-3.5 my-4">
        <span className="text-3xl">🚗</span>
        <h3 className="text-base sm:text-lg font-black text-white">No Trips Found</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          {searchQuery
            ? `No bookings match your query "${searchQuery}". Try a different keyword.`
            : `No ${filter === 'all' ? '' : filter.replace('_', ' ')} trips currently in database.`}
        </p>
        <button
          type="button"
          className="btn btn-gold px-5 py-2.5 rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-transform mt-2 shadow-lg shadow-amber-500/20"
          onClick={onOpenLogModal}
        >
          + Log New Trip
        </button>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 pb-24">
      {trips.map(trip => (
        <TripCard
          key={trip._id || trip.id}
          trip={trip}
          currentUser={currentUser}
          onSelect={onSelectTrip}
          onPrintVoucher={onPrintVoucher}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </section>
  );
}

export default memo(TripList);
