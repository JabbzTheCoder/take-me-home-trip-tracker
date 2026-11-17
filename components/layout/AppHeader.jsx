// components/layout/AppHeader.jsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

function AppHeader({ user, onOpenModal, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="flex items-center justify-between pb-5 sm:pb-6 border-b border-white/10 relative">
      {/* Driver Identity (Profile Trigger) */}
      <div
        className="flex items-center gap-3.5 cursor-pointer p-2 -ml-2 rounded-2xl hover:bg-white/5 active:scale-95 transition-all select-none group"
        onClick={() => onOpenModal('profile')}
        title="Tap to update profile, email, phone & picture"
      >
        <div className="relative">
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/20 group-hover:scale-105 transition-transform"
            />
          ) : (
            <span
              className="w-12 h-12 rounded-full font-black text-lg flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform"
              style={{ background: user?.avatarColor || '#38bdf8' }}
            >
              {user ? user.name.charAt(0).toUpperCase() : 'D'}
            </span>
          )}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg sm:text-xl text-white tracking-tight group-hover:text-amber-300 transition-colors">
              {user ? user.name : 'Driver'}
            </span>
            <span className="uppercase text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Admin
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
            <span className="text-emerald-400 font-semibold">Active Dispatch</span> • <span>Tap for Profile</span>
          </span>
        </div>
      </div>

      {/* Action Controls: Fleet & System Menu */}
      <div className="flex items-center gap-2 sm:gap-3" ref={menuRef}>
        <button
          type="button"
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 hover:scale-[1.02] active:scale-[0.97] transition-all shadow-sm"
          onClick={() => onOpenModal('cars')}
          title="Manage Fleet Vehicles"
        >
          <span className="text-sm">🚗</span>
          <span className="hidden xs:inline sm:inline">Fleet</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
          onClick={onLogout}
          title="Switch driver account / Return to Sign In"
        >
          <span>🔄</span>
          <span className="hidden xs:inline sm:inline">Switch Driver</span>
        </button>

        <button
          type="button"
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all text-slate-300 hover:text-white"
          onClick={() => setMenuOpen(prev => !prev)}
          title="Settings & System Menu"
          aria-expanded={menuOpen}
        >
          <span>⚙️</span>
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-16 right-0 w-64 bg-slate-900/98 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1 animate-scale-up">
            <div
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              onClick={() => {
                onOpenModal('profile');
                setMenuOpen(false);
              }}
            >
              <span className="text-lg">👤</span>
              <div className="flex flex-col">
                <strong className="text-sm font-bold text-white">Driver Profile</strong>
                <small className="text-xs text-slate-400">Name, phone, email & photo</small>
              </div>
            </div>

            <div
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              onClick={() => {
                onOpenModal('cars');
                setMenuOpen(false);
              }}
            >
              <span className="text-lg">🚗</span>
              <div className="flex flex-col">
                <strong className="text-sm font-bold text-white">Fleet Management</strong>
                <small className="text-xs text-slate-400">Polo, Fiesta, i20 fleet roster</small>
              </div>
            </div>

            <div
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              onClick={() => {
                onOpenModal('popia');
                setMenuOpen(false);
              }}
            >
              <span className="text-lg">🛡️</span>
              <div className="flex flex-col">
                <strong className="text-sm font-bold text-white">POPIA Compliance</strong>
                <small className="text-xs text-slate-400">Act 4 of 2013 data protection</small>
              </div>
            </div>

            <div
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              onClick={() => {
                onOpenModal('change_password');
                setMenuOpen(false);
              }}
            >
              <span className="text-lg">🔑</span>
              <div className="flex flex-col">
                <strong className="text-sm font-bold text-white">Change Password</strong>
                <small className="text-xs text-slate-400">Update private password</small>
              </div>
            </div>

            <div className="h-px bg-white/10 my-1"></div>

            <div
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-500/20 cursor-pointer transition-colors text-rose-300"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
            >
              <span className="text-lg">🚪</span>
              <div className="flex flex-col">
                <strong className="text-sm font-bold text-rose-400">Switch Driver / Sign Out</strong>
                <small className="text-xs text-rose-300/70">Return to driver selection</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default React.memo(AppHeader);
