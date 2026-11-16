// components/modals/ChangePasswordModal.jsx
'use client';

import React, { useState } from 'react';

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onChangePassword
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    const success = await onChangePassword(currentPassword, newPassword);
    setLoading(false);

    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] my-auto max-h-[calc(100dvh-2.5rem)] flex flex-col bg-slate-900 border border-white/15 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-slate-900/98 backdrop-blur-md px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-white">Change Driver Password</h2>
            <small className="text-xs text-amber-400 font-semibold">Update your secret credentials</small>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-all text-sm font-bold"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">New Password (min 6 chars) *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new private password"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new private password"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Sticky Actions */}
          <div className="sticky bottom-0 z-20 bg-slate-900/98 backdrop-blur-md pt-3 pb-1 border-t border-white/10 flex gap-2.5 mt-2">
            <button
              type="button"
              className="btn btn-secondary flex-1 py-3 rounded-xl text-xs font-bold"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold btn-glow flex-1 py-3 rounded-xl text-xs font-black"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
