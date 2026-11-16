// components/ui/LogTripFAB.jsx
import React from 'react';

export default function LogTripFAB({ onOpenLogModal }) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        className="btn-fab-log shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm select-none"
        onClick={onOpenLogModal}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Log Trip</span>
      </button>
    </div>
  );
}
