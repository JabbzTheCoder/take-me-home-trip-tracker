// components/modals/ProfileModal.jsx
'use client';

import React, { useState, useEffect } from 'react';

const PALETTE = ['#f59e0b', '#38bdf8', '#10b981', '#a855f7', '#f43f5e', '#ec4899', '#3b82f6'];

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
  onLogout
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [picBase64, setPicBase64] = useState('');
  const [color, setColor] = useState('#38bdf8');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setPicBase64(currentUser.profilePic || '');
      setColor(currentUser.avatarColor || '#38bdf8');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size exceeds 2MB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPicBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      name,
      email,
      phone,
      profilePic: picBase64,
      avatarColor: color
    });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] my-auto max-h-[calc(100dvh-2.5rem)] flex flex-col bg-slate-900 border border-white/15 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-slate-900/98 backdrop-blur-md px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-white">Driver Profile Settings</h2>
            <small className="text-xs text-amber-400 font-semibold">Chauffeur Credentials & Avatar</small>
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
          {/* Avatar Preview & File Input */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden shrink-0 border-2 border-amber-400 shadow-lg shadow-amber-500/20"
              style={{ background: picBase64 ? 'transparent' : color }}
            >
              {picBase64 ? (
                <img src={picBase64} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-slate-950">
                  {(name || 'D').charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <label className="text-xs font-bold text-white block">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
              />
              {picBase64 && (
                <button
                  type="button"
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold text-left"
                  onClick={() => setPicBase64('')}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="082 123 4567"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Avatar Theme Color</label>
            <div className="flex items-center gap-2.5">
              {PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Admin Powers Callout */}
          <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200 flex items-start gap-2.5">
            <span className="text-lg">🛡️</span>
            <div>
              <strong className="block font-bold text-white">Full Administrator Powers</strong>
              <p className="text-[11px] text-amber-300/80 leading-snug mt-0.5">
                All drivers (Jabbz, Tebza, Fresh) enjoy full administrative controls to manage trips, vehicles, and settings.
              </p>
            </div>
          </div>

          {/* Sticky Actions */}
          <div className="sticky bottom-0 z-20 bg-slate-900/98 backdrop-blur-md pt-3 pb-1 border-t border-white/10 flex flex-col gap-2.5 mt-2">
            <div className="flex gap-2.5">
              <button
                type="button"
                className="btn btn-secondary flex-1 py-3 rounded-xl text-xs font-bold"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-gold btn-glow flex-1 py-3 rounded-xl text-xs font-black"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🔄</span>
                <span>Wrong Profile? Switch Driver / Sign Out</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
