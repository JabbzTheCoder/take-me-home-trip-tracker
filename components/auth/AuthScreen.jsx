// components/auth/AuthScreen.jsx
'use client';

import React, { useState } from 'react';

const PRESETS = [
  { name: 'Jabbz', email: 'jabbz@tmh-fleet.co.za', color: '#f59e0b' },
  { name: 'Tebza', email: 'tebza@tmh-fleet.co.za', color: '#38bdf8' },
  { name: 'Fresh', email: 'fresh@tmh-fleet.co.za', color: '#10b981' }
];

export default function AuthScreen({ onLogin, onRegister }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handlePresetSelect = (preset) => {
    setEmail(preset.email);
    setPassword('driver123');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onRegister({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword
    });
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-[440px] bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl flex flex-col gap-5">
        {/* Branding Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/25 mb-3">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
              <path d="M5 17h10"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Take Me Home
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            Jabbz • Tebza • Fresh • Fleet Ops
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-white/10">
          <button
            type="button"
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'login'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setAuthMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'register'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setAuthMode('register')}
          >
            Register Driver
          </button>
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. jabbz@tmh-fleet.co.za"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">Password *</label>
                <button
                  type="button"
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your driver password"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Quick 1-Click Driver Preset Buttons */}
            <div className="pt-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                1-CLICK CHAUFFEUR LOGIN PRESET
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-amber-400/50 hover:bg-white/[0.08] active:scale-95 transition-all text-center"
                  >
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-slate-950 mb-1" style={{ background: p.color }}>
                      {p.name.charAt(0)}
                    </span>
                    <strong className="text-xs text-white">{p.name}</strong>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold btn-glow w-full py-3.5 rounded-xl font-black text-sm tracking-wide mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Chauffeur Console'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Driver Full Name *</label>
              <input
                type="text"
                required
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="e.g. Sibusiso 'Jabbz' Dlamini"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="e.g. newdriver@tmh-fleet.co.za"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={regPhone}
                onChange={e => setRegPhone(e.target.value)}
                placeholder="e.g. 082 555 1234"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password (min 6 chars) *</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="Create secure driver password"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold btn-glow w-full py-3.5 rounded-xl font-black text-sm tracking-wide mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Driver Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
