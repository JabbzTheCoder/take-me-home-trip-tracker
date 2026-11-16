// components/ui/ServiceBadge.jsx
import React from 'react';

export default function ServiceBadge({ type, className = '' }) {
  const isTakeMeHome = type === 'take_me_home';

  if (isTakeMeHome) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/30 ${className}`}>
        <span>🚗</span>
        <span>Take Me Home</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 ${className}`}>
      <span>🎩</span>
      <span>Chauffeur</span>
    </span>
  );
}
