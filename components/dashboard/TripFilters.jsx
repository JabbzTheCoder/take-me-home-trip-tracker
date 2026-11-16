// components/dashboard/TripFilters.jsx
import React from 'react';

export default function TripFilters({
  filter,
  setFilter,
  searchQuery = '',
  setSearchQuery,
  trips = []
}) {
  const total = trips.length;
  const tmhCount = trips.filter(t => t.type === 'take_me_home').length;
  const chauffeurCount = trips.filter(t => t.type === 'chauffeur').length;
  const transitCount = trips.filter(t => t.status === 'in_progress').length;
  const completedCount = trips.filter(t => t.status === 'completed').length;

  const tabs = [
    { id: 'all', label: 'All Trips', count: total },
    { id: 'take_me_home', label: '🚗 Take Me Home', count: tmhCount },
    { id: 'chauffeur', label: '🎩 Chauffeur', count: chauffeurCount },
    { id: 'in_progress', label: '● In Transit', count: transitCount },
    { id: 'completed', label: '✓ Completed', count: completedCount }
  ];

  return (
    <div className="flex flex-col gap-3.5 mb-5 sm:mb-6">
      {/* Search Input Bar */}
      <div className="relative w-full">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by client, pickup, dropoff, vehicle, or driver name..."
          className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-white/10 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {tabs.map(tab => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 active:scale-95 ${
                isActive
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-500/10'
                  : 'bg-white/[0.04] text-slate-400 border border-white/5 hover:text-white hover:bg-white/[0.08]'
              }`}
              onClick={() => setFilter(tab.id)}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
