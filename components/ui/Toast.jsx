// components/ui/Toast.jsx
import React from 'react';

export default function ToastContainer({ toasts = [] }) {
  if (!toasts.length) return null;

  return (
    <div
      id="toast-container"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2.5 pointer-events-none w-full max-w-md px-4"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-2xl border text-sm font-bold tracking-tight animate-slide-down transition-all duration-200 ${
            t.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-950/50'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/50'
          }`}
        >
          <span className="text-base shrink-0">
            {t.type === 'error' ? '⚠️' : '✓'}
          </span>
          <span className="leading-snug">{t.text}</span>
        </div>
      ))}
    </div>
  );
}
