// components/modals/PopiaModal.jsx
'use client';

import React from 'react';

export default function PopiaModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] my-auto max-h-[calc(100dvh-2.5rem)] flex flex-col bg-slate-900 border border-white/15 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-slate-900/98 backdrop-blur-md px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-white">POPIA Compliance Notice</h2>
            <small className="text-xs text-emerald-400 font-semibold">Protection of Personal Information Act (Act 4 of 2013)</small>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-all text-sm font-bold"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div className="text-xs">
              <strong className="text-emerald-300 font-bold block">Active Statutory Safeguards</strong>
              <p className="text-slate-300 leading-tight mt-0.5">
                Client personal & transit data is encrypted, processed solely for chauffeur dispatch, and secured in line with South African statutory law.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-cyan-500/20 text-cyan-300">1</span>
              <div>
                <strong className="text-white block font-bold mb-0.5">Condition 1: Accountability</strong>
                <p className="text-slate-400">Jabbz, Tebza, and Fresh uphold strict responsible processing standards for passenger identities, phone numbers, and destination addresses.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-cyan-500/20 text-cyan-300">2</span>
              <div>
                <strong className="text-white block font-bold mb-0.5">Condition 2: Processing Limitation</strong>
                <p className="text-slate-400">Information is processed strictly with passenger booking consent solely for real-time dispatch, route safety, and billing verification.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-cyan-500/20 text-cyan-300">3</span>
              <div>
                <strong className="text-white block font-bold mb-0.5">Condition 3: Purpose Specification</strong>
                <p className="text-slate-400">Trip records are collected for legitimate operational audit trails and retained only as long as required by insurance standards.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-cyan-500/20 text-cyan-300">7</span>
              <div>
                <strong className="text-white block font-bold mb-0.5">Condition 7: Security Safeguards</strong>
                <p className="text-slate-400">Database communication is TLS encrypted, driver sessions are authenticated with secure JWT tokens, and zero plain-text passwords exist.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-30 bg-slate-900/98 backdrop-blur-md px-5 py-3.5 border-t border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            className="btn btn-gold btn-full py-2.5 rounded-xl text-xs font-bold"
            onClick={onClose}
          >
            Understood & Acknowledged
          </button>
        </div>
      </div>
    </div>
  );
}
