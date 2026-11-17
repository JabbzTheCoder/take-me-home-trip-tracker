// components/auth/MandatoryPasswordChange.jsx
'use client';

import React, { useState } from 'react';

export default function MandatoryPasswordChange({ user, onComplete, onLogout }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    const success = await onComplete(newPassword);
    setLoading(false);

    if (!success) {
      setError('Failed to update password. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-[440px] bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl flex flex-col gap-5">
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 text-2xl mb-3 shadow-xl shadow-amber-500/30">
            🔒
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Security Requirement</h1>
          <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-1">Set Your Private Driver Password</p>
          <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
            Welcome, <strong className="text-white">{user?.name}</strong>! To ensure other drivers cannot access your account or log in with your identity, you must personalize your private password now before accessing the dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">New Private Password (min 6 chars) *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Create your new secret password"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new secret password"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-gold btn-glow w-full py-3.5 rounded-xl font-black text-sm tracking-wide mt-2"
          >
            {loading ? 'Securing Account...' : 'Set My Private Password & Enter'}
          </button>
        </form>

        {/* Back to Sign In Option */}
        <div className="pt-2 text-center border-t border-white/10 flex flex-col items-center gap-2">
          <p className="text-xs text-slate-400">
            Selected the wrong driver profile?
          </p>
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>←</span>
            <span>Return to Sign In (Select Different Driver)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
