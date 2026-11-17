// components/dashboard/TripFilters.jsx
'use client';

import React, { useState, useEffect, useRef, memo, useTransition } from 'react';

function TripFilters({
  filter,
  setFilter,
  searchQuery = '',
  setSearchQuery,
  trips = []
}) {
  // Local input state for instantaneous 0ms typing response on mobile
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceTimerRef = useRef(null);
  const [, startTransition] = useTransition();

  // Sync if parent clears or changes searchQuery externally
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    // 1. Instant local state update for 120fps typing response on phone keyboard
    setLocalQuery(val);

    // 2. Debounced non-blocking propagation to parent list filter
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      startTransition(() => {
        setSearchQuery(val);
      });
    }, 150);
  };

  const handleClear = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setLocalQuery('');
    setSearchQuery('');
  };

  const total = trips.length;
  const tmhCount = trips.filter(t => t.type === 'take_me_home').length;
  const chauffeurCount = trips.filter(t => t.type === 'chauffeur').length;
  const completedCount = trips.filter(t => t.status === 'completed').length;
  const deferredCount = trips.filter(t => t.status === 'deferred').length;

  const tabs = [
    { id: 'all', label: 'All Trips', count: total },
    { id: 'take_me_home', label: '🚗 Take Me Home', count: tmhCount },
    { id: 'chauffeur', label: '🎩 Chauffeur', count: chauffeurCount },
    { id: 'completed', label: '✓ Completed', count: completedCount },
    { id: 'deferred', label: '⏸ Deferred', count: deferredCount }
  ];

  return (
    <div className="flex flex-col gap-3.5 mb-5 sm:mb-6">
      {/* Search Input Bar */}
      <div className="relative w-full">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          placeholder="Search by client, pickup, dropoff, vehicle, or driver name..."
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-colors shadow-sm"
        />
        {localQuery && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-white/10 rounded-full w-6 h-6 flex items-center justify-center transition-colors active:scale-90"
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

export default memo(TripFilters);
