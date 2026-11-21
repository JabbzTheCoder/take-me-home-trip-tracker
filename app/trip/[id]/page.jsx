// app/trip/[id]/page.jsx - Direct Trip Review, Driver Authentication & Journey Dispatch
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/helpers';
import StatusBadge from '@/components/ui/StatusBadge';
import ServiceBadge from '@/components/ui/ServiceBadge';
import { calculateTripSplits } from '@/lib/splits';
import {
  getSecondaryDriverDispatchNotification,
  getTripAcceptedNotification,
  getTripDeclinedNotification,
  getTripCompletionNotifications,
  getTripChangeNotification,
  buildWhatsAppUrl
} from '@/lib/whatsapp';

export default function TripReviewPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id;

  const [trip, setTrip] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authentication Drawer / Quick Login State
  const [selectedDriverEmail, setSelectedDriverEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Decline Reason Drawer State
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Cancel / Pause Drawer State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // WhatsApp Alert Prompt State
  const [activeWhatsAppModal, setActiveWhatsAppModal] = useState(null); // { title, message, url, buttonText }

  // Quick driver list for 1-tap sign-in
  const quickDrivers = useMemo(() => [
    { name: 'Jabbz', email: 'jabbz@tmh-fleet.co.za', color: '#38bdf8', phone: '+27 82 450 1198' },
    { name: 'Tebza', email: 'tebza@tmh-fleet.co.za', color: '#f59e0b', phone: '+27 73 892 4431' },
    { name: 'Fresh', email: 'fresh@tmh-fleet.co.za', color: '#10b981', phone: '+27 84 551 7732' }
  ], []);

  // 1. Fetch trip and verify session token
  const loadTripData = useCallback(async (authToken) => {
    if (!tripId) return;
    try {
      setLoading(true);
      setError(null);

      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`/api/trips/${tripId}`, { headers });
      const data = await res.json();

      if (!res.ok || !data.success || !data.trip) {
        throw new Error(data.message || 'Trip record not found');
      }

      setTrip(data.trip);

      // Verify current user if token is present
      if (authToken) {
        const userRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const userData = await userRes.json();
        if (userData.success && userData.user) {
          setCurrentUser(userData.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem('tmh_auth_token');
          setToken(null);
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.error('Failed to load trip:', err);
      setError(err.message || 'Could not load trip record.');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    const storedToken = localStorage.getItem('tmh_auth_token');
    if (storedToken) {
      setToken(storedToken);
      loadTripData(storedToken);
    } else {
      loadTripData(null);
    }
  }, [loadTripData]);

  // Pre-select the assigned secondary driver in quick sign-in if matching
  useEffect(() => {
    if (trip && !currentUser) {
      const chaseName = (trip.chaseDriverName || '').trim().toLowerCase();
      const match = quickDrivers.find(d => d.name.toLowerCase() === chaseName);
      if (match) {
        setSelectedDriverEmail(match.email);
      } else {
        setSelectedDriverEmail(quickDrivers[0].email);
      }
    }
  }, [trip, currentUser, quickDrivers]);

  // Handle Quick Driver Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!selectedDriverEmail || !password) {
      setLoginError('Please select your driver profile and enter your password.');
      return;
    }

    try {
      setLoggingIn(true);
      setLoginError('');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedDriverEmail, password })
      });
      const data = await res.json();

      if (data.success && data.token && data.user) {
        localStorage.setItem('tmh_auth_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setPassword('');
        loadTripData(data.token);
      } else {
        setLoginError(data.message || 'Invalid driver credentials. Check password.');
      }
    } catch (err) {
      setLoginError('Sign in failed. Please verify network connection.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tmh_auth_token');
    setToken(null);
    setCurrentUser(null);
  };

  // Driver Assignment Checks
  const currentUserName = (currentUser?.name || '').trim().toLowerCase();
  const isTakeMeHome = trip?.type === 'take_me_home';
  const isPrimaryDriver = isTakeMeHome
    ? (trip?.clientDriverName && trip.clientDriverName.trim().toLowerCase() === currentUserName)
    : (trip?.driverName && trip.driverName.trim().toLowerCase() === currentUserName);
  const isSecondaryDriver = isTakeMeHome && trip?.chaseDriverName && trip.chaseDriverName.trim().toLowerCase() === currentUserName;
  const isAssigned = isPrimaryDriver || isSecondaryDriver;

  const isCompleted = trip?.status === 'completed';
  const isPending = (trip?.status || 'pending') === 'pending';
  const isConfirmed = trip?.status === 'confirmed';
  const isDeclined = trip?.status === 'declined';
  const isCancelledOrPaused =
    trip?.status === 'deferred' ||
    trip?.status === 'cancelled' ||
    trip?.status === 'paused' ||
    trip?.status === 'cancelled_paused';

  const splitInfo = useMemo(() => {
    return trip ? calculateTripSplits(trip) : null;
  }, [trip]);

  // ACTION: Accept Trip (Secondary Driver -> Confirmed)
  const handleAcceptTrip = async () => {
    if (!token) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'accept' })
      });
      const data = await res.json();

      if (data.success && data.trip) {
        setTrip(data.trip);
        // Show WhatsApp notification modal to send update to primary driver
        const notif = getTripAcceptedNotification(data.trip, currentUser?.name);
        setActiveWhatsAppModal({
          title: 'Trip Assignment Accepted! 🤝',
          description: `You have confirmed this trip. Please notify the lead driver (${data.trip.clientDriverName || 'Primary Driver'}) on WhatsApp so they can prepare:`,
          url: notif.url,
          buttonText: `💬 Send Confirmation to ${notif.recipientName} on WhatsApp`,
          rawText: notif.text
        });
      } else {
        alert(data.message || 'Failed to accept trip.');
      }
    } catch (err) {
      alert('Error accepting trip assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION: Decline Trip with Reason (Secondary Driver -> Declined)
  const handleConfirmDecline = async (reasonToUse) => {
    const finalReason = reasonToUse || declineReason;
    if (!finalReason.trim()) {
      alert('Please specify a reason for declining this trip assignment.');
      return;
    }
    if (!token) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'decline',
          declineReason: finalReason
        })
      });
      const data = await res.json();

      if (data.success && data.trip) {
        setTrip(data.trip);
        setShowDeclineModal(false);
        setDeclineReason('');

        const notif = getTripDeclinedNotification(data.trip, currentUser?.name, finalReason);
        setActiveWhatsAppModal({
          title: 'Assignment Declined ❌',
          description: `You have declined this trip assignment. Please alert the lead driver (${data.trip.clientDriverName || 'Primary Driver'}) via WhatsApp so they can re-assign:`,
          url: notif.url,
          buttonText: `💬 Send Notice to ${notif.recipientName} on WhatsApp`,
          rawText: notif.text
        });
      } else {
        alert(data.message || 'Failed to decline trip.');
      }
    } catch (err) {
      alert('Error declining trip assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION: Complete Trip (Assigned Driver -> Completed, Permanently Locked)
  const handleCompleteTrip = async () => {
    if (!window.confirm('Mark this trip as COMPLETED? Once finalized, the trip is locked and splits are sealed.')) {
      return;
    }
    if (!token) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'complete' })
      });
      const data = await res.json();

      if (data.success && data.trip) {
        setTrip(data.trip);
        const notifs = getTripCompletionNotifications(data.trip, currentUser?.name);
        const isUserLead = (data.trip.clientDriverName || '').toLowerCase() === currentUserName;
        const targetNotif = isUserLead ? notifs.chaseNotification : notifs.leadNotification;

        setActiveWhatsAppModal({
          title: 'Trip Finalized & Locked! 🏁🔒',
          description: `Trip #${data.trip.invoiceNumber} is marked Completed and sealed into Friday Payout pool. Send completion confirmation and split summary to your co-driver:`,
          url: targetNotif.url,
          buttonText: `💬 Send Split Summary to ${targetNotif.recipientName} on WhatsApp`,
          rawText: targetNotif.text
        });
      } else {
        alert(data.message || 'Failed to complete trip.');
      }
    } catch (err) {
      alert('Error finalizing trip.');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION: Cancel or Pause Trip with Reason
  const handleConfirmCancelPause = async (reasonToUse) => {
    const finalReason = reasonToUse || cancelReason;
    if (!finalReason.trim()) {
      alert('Please provide a specific cancellation or pause reason.');
      return;
    }
    if (!token) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'cancelled',
          deferReason: finalReason
        })
      });
      const data = await res.json();

      if (data.success && data.trip) {
        setTrip(data.trip);
        setShowCancelModal(false);
        setCancelReason('');

        const alerts = getTripChangeNotification(
          data.trip,
          currentUser?.name,
          `Status changed to Cancelled / Paused (Reason: ${finalReason})`
        );
        const coDriverAlert = alerts.find(a => (a.recipientName || '').toLowerCase() !== currentUserName) || alerts[0];

        if (coDriverAlert) {
          setActiveWhatsAppModal({
            title: 'Trip Cancelled / Paused ⏸',
            description: `This booking has been flagged as Cancelled / Paused. Alert your assigned co-driver on WhatsApp:`,
            url: coDriverAlert.url,
            buttonText: `💬 Notify ${coDriverAlert.recipientName} on WhatsApp`,
            rawText: coDriverAlert.text
          });
        }
      } else {
        alert(data.message || 'Failed to cancel or pause trip.');
      }
    } catch (err) {
      alert('Error updating trip status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Dispatch secondary driver assignment via WhatsApp
  const handleDispatchSecondaryWhatsApp = () => {
    if (!trip) return;
    const notif = getSecondaryDriverDispatchNotification(trip);
    window.open(notif.url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-amber-300">Verifying Trip & Driver Assignment...</p>
        <span className="text-xs text-slate-500 mt-1">Take Me Home Fleet Protocol</span>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-xl font-black text-rose-400">Trip Record Not Found</h2>
          <p className="text-sm text-slate-300">{error || 'This trip could not be retrieved or the link has expired.'}</p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-gold w-full py-3 rounded-xl font-bold text-xs"
          >
            ← Open Fleet Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      
      {/* 1. TOP APP BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all text-xs font-bold"
            title="Return to Dashboard"
          >
            ←
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>Take Me Home</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                #{trip.invoiceNumber || 'NEW'}
              </span>
            </h1>
            <small className="text-[11px] text-slate-400 font-medium">Driver Assignment Verification & Trip Details</small>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="font-bold text-white">{currentUser.name}</span>
              <span className="text-[10px] text-emerald-400">Authenticated</span>
            </div>
            <div
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs shadow-sm"
              style={{ backgroundColor: currentUser.avatarColor || '#38bdf8' }}
            >
              {currentUser.name?.[0] || 'D'}
            </div>
            <button
              onClick={handleLogout}
              className="text-[11px] text-slate-400 hover:text-rose-400 ml-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              title="Sign Out"
            >
              Exit
            </button>
          </div>
        )}
      </header>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-5">

        {/* TRIP STATUS JOURNEY STEPPER */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Trip Journey Status</span>
            <StatusBadge status={trip.status} showLock={isCompleted} />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold select-none">
            {/* Step 1: Pending */}
            <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              isPending
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-white/[0.02] border-white/5 text-slate-500'
            }`}>
              <span className="text-sm">⏳</span>
              <span>1. Pending</span>
            </div>

            {/* Step 2: Confirmed */}
            <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              isConfirmed
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-md shadow-sky-500/10'
                : (isCompleted ? 'bg-white/[0.04] border-white/10 text-slate-400' : 'bg-white/[0.02] border-white/5 text-slate-500')
            }`}>
              <span className="text-sm">🤝</span>
              <span>2. Confirmed</span>
            </div>

            {/* Step 3: Service */}
            <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              isConfirmed
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                : (isCompleted ? 'bg-white/[0.04] border-white/10 text-slate-400' : 'bg-white/[0.02] border-white/5 text-slate-500')
            }`}>
              <span className="text-sm">🚗</span>
              <span>3. Service</span>
            </div>

            {/* Step 4: Completed */}
            <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              isCompleted
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                : (isDeclined ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' : 'bg-white/[0.02] border-white/5 text-slate-500')
            }`}>
              <span className="text-sm">{isDeclined ? '✕' : '🔒'}</span>
              <span>{isDeclined ? 'Declined' : '4. Locked'}</span>
            </div>
          </div>
        </div>

        {/* DRIVER AUTHENTICATION & VERIFICATION BLOCK */}
        {!currentUser ? (
          /* Unauthenticated State: Mobile-First Quick Login */
          <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-xl shrink-0">
                🔐
              </div>
              <div>
                <h3 className="text-base font-black text-white">Driver Verification Required</h3>
                <p className="text-xs text-slate-400">
                  Select your profile and enter your fleet password to verify assignment:
                </p>
              </div>
            </div>

            {/* 1-Tap Driver Select */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {quickDrivers.map(d => {
                const isSelected = selectedDriverEmail === d.email;
                const isAssignedToThis = (trip.chaseDriverName || '').toLowerCase() === d.name.toLowerCase() ||
                                         (trip.clientDriverName || '').toLowerCase() === d.name.toLowerCase();

                return (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => {
                      setSelectedDriverEmail(d.email);
                      setLoginError('');
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 shadow-md shadow-amber-400/20 scale-[1.02]'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 shadow"
                      style={{ backgroundColor: d.color }}
                    >
                      {d.name[0]}
                    </div>
                    <span className="text-xs font-bold text-white truncate w-full">{d.name}</span>
                    {isAssignedToThis && (
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                        Assigned
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleLogin} className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Fleet Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your TMH password..."
                  required
                  className="w-full bg-slate-950 border border-white/20 rounded-xl p-3 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn || !password}
                className="btn btn-gold btn-glow w-full py-3.5 rounded-xl font-black text-sm active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {loggingIn ? 'Verifying Credentials...' : 'Verify & Continue ›'}
              </button>
            </form>
          </div>
        ) : !isAssigned ? (
          /* Authenticated but Not Assigned */
          <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-black text-sm text-white">
              <span>👁️</span>
              <span>Read-Only View</span>
            </div>
            <p className="leading-relaxed">
              You are signed in as <strong>{currentUser.name}</strong>, but this trip is assigned to <strong>{trip.clientDriverName || 'Lead'}</strong> & <strong>{trip.chaseDriverName || 'Chase'}</strong>.
              You may view the trip itinerary, but only assigned drivers can accept, decline, complete, or edit splits.
            </p>
            <button
              onClick={handleLogout}
              className="text-amber-300 font-bold underline hover:text-white mt-1"
            >
              Switch to assigned driver account
            </button>
          </div>
        ) : (
          /* Authenticated & Verified as Assigned Driver */
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-base">✓</span>
              <span>
                Verified as {isSecondaryDriver ? 'Secondary Assigned Driver (Chase)' : 'Primary Assigned Driver (Lead)'}
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300">
              Verified Driver
            </span>
          </div>
        )}

        {/* PENDING ASSIGNMENT ACTION CARD (FOR SECONDARY DRIVER) */}
        {currentUser && isSecondaryDriver && isPending && (
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-amber-500/20 to-slate-900 border-2 border-amber-400 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-black text-lg shrink-0 shadow-md">
                🔔
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">New Assignment Request</h3>
                <p className="text-xs text-amber-200 leading-relaxed mt-0.5">
                  <strong>{trip.clientDriverName || 'Primary Driver'}</strong> assigned you as escort/chase driver for this trip. Please confirm your availability or decline with a reason:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleAcceptTrip}
                className="py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>Accept Trip</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowDeclineModal(true)}
                className="py-3.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs sm:text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>✕</span>
                <span>Decline Trip</span>
              </button>
            </div>
          </div>
        )}

        {/* PRIMARY DRIVER PENDING DISPATCH NOTICE */}
        {currentUser && isPrimaryDriver && isPending && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <span className="animate-spin">⏳</span>
                <span>Awaiting Secondary Driver Acceptance</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">{trip.chaseDriverName || 'Chase Driver'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              This trip is in <strong>Pending</strong> status waiting for <strong>{trip.chaseDriverName}</strong> to review and accept. You can re-send the WhatsApp dispatch link below:
            </p>
            <button
              type="button"
              onClick={handleDispatchSecondaryWhatsApp}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>💬</span>
              <span>Re-send WhatsApp Dispatch to {trip.chaseDriverName}</span>
            </button>
          </div>
        )}

        {/* STATUS NOTICES: CONFIRMED, COMPLETED, DECLINED, CANCELLED */}
        {isConfirmed && (
          <div className="p-4 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-semibold">
              <span className="text-lg">🤝</span>
              <span>Trip is Confirmed & Active for Service. Ready for fulfillment.</span>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5">
            <span className="text-lg">🔒</span>
            <div className="leading-tight">
              <strong className="text-white block font-bold">Trip Completed & Locked:</strong>
              This trip has been finalized. As per operational rules, splits, costs, and notes are permanently locked in.
            </div>
          </div>
        )}

        {isDeclined && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-white">
              <span>✕</span>
              <span>Assignment Declined by {trip.declinedBy || trip.chaseDriverName || 'Secondary Driver'}</span>
            </div>
            <p className="italic text-rose-300">
              Reason: "{trip.declineReason || 'Unavailable'}"
            </p>
          </div>
        )}

        {isCancelledOrPaused && (
          <div className="p-4 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-white">
              <span>⏸</span>
              <span>Trip Cancelled / Paused</span>
            </div>
            <p className="italic text-purple-300">
              Reason: "{trip.deferReason || 'Client request'}"
            </p>
          </div>
        )}

        {/* TRIP DETAILS MASTER CARD */}
        <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-6">

          {/* Header & Service Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 flex-wrap">
              <ServiceBadge type={trip.type} />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">
                {trip.profile === 'profile2' ? 'Profile 2' : 'Profile 1'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-emerald-400 block">
                {formatCurrency(trip.fare)}
              </span>
              <small className="text-[10px] text-slate-400 uppercase font-semibold">Gross Booking Rate</small>
            </div>
          </div>

          {/* Client & Route Section */}
          <div className="space-y-4">
            <div>
              <small className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Client Information
              </small>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white">{trip.clientName}</h2>
                {trip.clientPhone && (
                  <a
                    href={`tel:${trip.clientPhone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/25 transition-colors"
                  >
                    <span>📞 {trip.clientPhone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Vertical Route Flow */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></span>
                <div>
                  <small className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</small>
                  <p className="text-sm font-semibold text-white">{trip.pickup}</p>
                </div>
              </div>

              <div className="w-0.5 h-4 bg-white/15 ml-[4.5px] -my-1"></div>

              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                <div>
                  <small className="text-[10px] uppercase font-bold text-slate-400 block">Dropoff Destination</small>
                  <p className="text-sm font-semibold text-white">{trip.dropoff}</p>
                </div>
              </div>
            </div>

            {/* Schedule & Vehicles Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <small className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date & Time</small>
                <p className="font-semibold text-white">{formatDate(trip.date)}</p>
                <p className="text-amber-300 font-mono font-bold mt-0.5">{trip.time}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <small className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Client Vehicle</small>
                <p className="font-semibold text-white truncate">{trip.clientCar || 'Private Client Vehicle'}</p>
                {trip.chaseCar && (
                  <p className="text-cyan-300 font-mono text-[11px] truncate mt-0.5">Escort: {trip.chaseCar}</p>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Drivers & Fare Split Breakdown */}
          {splitInfo && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  👥 Assigned Drivers & Fare Splits
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  Net Pool: {formatCurrency(splitInfo.netFare)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Lead Driver */}
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-amber-300 font-bold">Lead Driver</span>
                    <span className="text-slate-400">{splitInfo.leadDriverPercent}%</span>
                  </div>
                  <p className="text-sm font-black text-white truncate">{trip.clientDriverName || 'Lead'}</p>
                  <p className="text-base font-black font-mono text-emerald-300 mt-1">
                    {formatCurrency(splitInfo.leadFinalPayout)}
                  </p>
                </div>

                {/* Chase Driver */}
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-cyan-300 font-bold">Chase Driver</span>
                    <span className="text-slate-400">{splitInfo.chaseDriverPercent}%</span>
                  </div>
                  <p className="text-sm font-black text-white truncate">{trip.chaseDriverName || 'Chase'}</p>
                  <p className="text-base font-black font-mono text-cyan-300 mt-1">
                    {formatCurrency(splitInfo.chaseFinalPayout)}
                  </p>
                </div>
              </div>

              {splitInfo.totalExtraCosts > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] flex items-center justify-between text-rose-300">
                  <span>Extra Trip Costs (Fuel / Tolls):</span>
                  <span className="font-mono font-bold">-{formatCurrency(splitInfo.totalExtraCosts)}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {trip.notes && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 italic">
              "{trip.notes}"
            </div>
          )}
        </div>

        {/* 3. ASSIGNED DRIVER BOTTOM WORKFLOW ACTIONS */}
        {currentUser && isAssigned && (
          <div className="space-y-3 pt-2">
            {/* If Confirmed or Deferred: Option to Complete Trip */}
            {(isConfirmed || isCancelledOrPaused) && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCompleteTrip}
                className="btn btn-emerald w-full py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>Complete Trip & Seal Splits (Lock)</span>
              </button>
            )}

            {/* Between Confirmed and Completed: Option to Cancel or Pause */}
            {isConfirmed && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3.5 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-xs tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>⏸</span>
                <span>Client Cancelled or Deferred / Paused</span>
              </button>
            )}

            {/* Direct Link to Standalone Tax Invoice PDF */}
            <button
              type="button"
              onClick={() => router.push(`/invoice/${trip._id || trip.id}`)}
              className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>📄</span>
              <span>Open Official Tax Invoice PDF</span>
            </button>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="p-4 text-center text-[11px] text-slate-500 border-t border-white/5 mt-8">
        Take Me Home Fleet Management & Driver Dispatch Operations • Confidential
      </footer>

      {/* MODAL: DECLINE REASON DRAWER */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span className="text-rose-400">✕</span>
                <span>Decline Trip Assignment</span>
              </h3>
              <button
                onClick={() => setShowDeclineModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Please specify the reason why you cannot take this trip so <strong>{trip.clientDriverName}</strong> can re-assign or adjust:
            </p>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                'Off-duty / Resting',
                'Vehicle mechanical issue',
                'Prior booking / Schedule clash',
                'Too far from pickup address',
                'Family emergency'
              ].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDeclineReason(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    declineReason === preset
                      ? 'bg-rose-500/30 border-rose-400 text-rose-200'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              placeholder="Or write custom decline explanation..."
              rows={2}
              className="w-full bg-slate-950 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !declineReason.trim()}
                onClick={() => handleConfirmDecline()}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {actionLoading ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CANCEL / PAUSE REASON DRAWER */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span className="text-purple-400">⏸</span>
                <span>Cancel or Pause Trip</span>
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Trips cannot be deleted once created for audit compliance. Provide the client's reason:
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                'Client cancelled at pickup',
                'Client postponed / deferred to later',
                'No-show / Client unresponsive',
                'Vehicle breakdown / towing required'
              ].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCancelReason(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    cancelReason === preset
                      ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Specific cancellation details..."
              rows={2}
              className="w-full bg-slate-950 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !cancelReason.trim()}
                onClick={() => handleConfirmCancelPause()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-black text-white shadow-lg shadow-purple-600/30 disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Confirm Cancel / Pause'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WHATSAPP NOTIFICATION DISPATCH MODAL */}
      {activeWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shrink-0">
                💬
              </div>
              <div>
                <h3 className="text-base font-black text-white">{activeWhatsAppModal.title}</h3>
                <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider">
                  WhatsApp Dispatch Ready
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeWhatsAppModal.description}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
              {activeWhatsAppModal.rawText}
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={activeWhatsAppModal.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveWhatsAppModal(null)}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{activeWhatsAppModal.buttonText}</span>
              </a>

              <button
                type="button"
                onClick={() => setActiveWhatsAppModal(null)}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
