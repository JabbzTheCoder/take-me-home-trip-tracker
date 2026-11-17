// components/ui/StatusBadge.jsx
import React from 'react';

export default function StatusBadge({ status, className = '', showLock = false }) {
  if (status === 'deferred') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 tracking-wide shadow-sm shadow-purple-500/10 ${className}`}>
        <span className="text-[11px] shrink-0">⏸</span>
        <span>Deferred</span>
      </span>
    );
  }

  // All non-deferred trips are Completed (status cannot be changed)
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 tracking-wide shadow-sm shadow-emerald-500/10 ${className}`}>
      <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
      </svg>
      <span>Completed</span>
      {showLock && <span className="text-[10px] opacity-75 ml-0.5" title="Locked: Completed status is final">🔒</span>}
    </span>
  );
}
