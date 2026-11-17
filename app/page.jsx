'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import AppHeader from '@/components/layout/AppHeader';
import StatsOverview from '@/components/dashboard/StatsOverview';
import TripFilters from '@/components/dashboard/TripFilters';
import TripList from '@/components/dashboard/TripList';
import LogTripFAB from '@/components/ui/LogTripFAB';
import ToastContainer from '@/components/ui/Toast';
import TripDetailModal from '@/components/modals/TripDetailModal';
import LogTripModal from '@/components/modals/LogTripModal';
import FleetModal from '@/components/modals/FleetModal';
import ProfileModal from '@/components/modals/ProfileModal';
import PopiaModal from '@/components/modals/PopiaModal';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import TaxInvoiceModal from '@/components/modals/TaxInvoiceModal';
import AuthScreen from '@/components/auth/AuthScreen';
import MandatoryPasswordChange from '@/components/auth/MandatoryPasswordChange';
import { isTripCancelledOrPaused } from '@/lib/helpers';

export default function Home() {
  // Authentication & User State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // App Data State
  const [trips, setTrips] = useState([]);
  const [cars, setCars] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceTrip, setInvoiceTrip] = useState(null);

  // Modals & UI State
  // activeModal: null | 'trip-detail' | 'log-trip' | 'fleet' | 'profile' | 'change-password' | 'popia'
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Notification Dispatcher (Centered at top of screen)
  const showToast = useCallback((text, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  // Fetch current user details
  const fetchCurrentUser = useCallback(async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        loadTripsAndCars(authToken);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.warn('Session verification error:', err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Trips & Fleet Cars
  const loadTripsAndCars = useCallback(async (authToken) => {
    const t = authToken || token;
    if (!t) return;
    try {
      const [tripsRes, carsRes] = await Promise.all([
        fetch('/api/trips', { headers: { Authorization: `Bearer ${t}` } }),
        fetch('/api/cars', { headers: { Authorization: `Bearer ${t}` } })
      ]);
      const tripsData = await tripsRes.json();
      const carsData = await carsRes.json();

      if (tripsData.success) setTrips(tripsData.trips || []);
      if (carsData.success) setCars(carsData.cars || []);
    } catch (err) {
      showToast('Failed to sync fleet database', 'error');
    }
  }, [token, showToast]);

  // Check stored auth token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('tmh_auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  // Auth: Login
  const handleLogin = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('tmh_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(`Welcome back, ${data.user.name}!`);
        loadTripsAndCars(data.token);
      } else {
        showToast(data.message || 'Login failed. Please check credentials.', 'error');
      }
    } catch (err) {
      showToast('Network error during authentication', 'error');
    }
  };

  // Auth: Register
  const handleRegister = async (regData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('tmh_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(`Driver ${data.user.name} registered! Welcome aboard.`);
        loadTripsAndCars(data.token);
      } else {
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast('Network error registering driver', 'error');
    }
  };

  // Auth: Logout
  const handleLogout = () => {
    localStorage.removeItem('tmh_auth_token');
    setToken(null);
    setUser(null);
    setTrips([]);
    setCars([]);
    setActiveModal(null);
    setSelectedTrip(null);
    showToast('Signed out of fleet portal');
  };

  // Auth: Mandatory First-Login Password Change
  const handleMandatoryPasswordChange = async (newPassword) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: '',
          newPassword
        })
      });
      const data = await res.json();

      if (data.success) {
        showToast('Password updated! Your account is now active.');
        setUser(prev => ({ ...prev, mustChangePassword: false }));
        return true;
      } else {
        showToast(data.message || 'Failed to update password', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error updating password', 'error');
      return false;
    }
  };

  // Auth: Standard Voluntary Password Change
  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();

      if (data.success) {
        showToast('Password updated successfully!');
        setActiveModal(null);
        return true;
      } else {
        showToast(data.message || 'Password update failed', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error updating password', 'error');
      return false;
    }
  };

  // Profile: Update Driver Profile (Name, Phone, Email, Photo, Color)
  const handleUpdateProfile = async (profileData) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        showToast('Profile updated successfully!');
        setActiveModal(null);
        return true;
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error updating profile', 'error');
      return false;
    }
  };

  // Modal Navigation Handlers (Stable References)
  const handleOpenModal = useCallback((modalId) => {
    setActiveModal(modalId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const handleSelectTrip = useCallback((trip) => {
    setSelectedTrip(trip);
    setActiveModal('trip-detail');
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setActiveModal(null);
    setSelectedTrip(null);
  }, []);

  const handleOpenLogModal = useCallback(() => {
    setActiveModal('log-trip');
  }, []);

  // Trips: Toggle Status (Complete Deferred Trips; Completed Trips are Locked)
  const handleToggleTripStatus = useCallback(async (trip, explicitStatus) => {
    if (trip.status === 'completed') {
      showToast('Status Change Rule: Completed trips are final and locked.', 'error');
      return;
    }

    const tripId = trip._id || trip.id;
    const newStatus = explicitStatus || 'completed';

    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();

      if (data.success && data.trip) {
        showToast('Trip finalized as Completed (Status Locked)');
        setTrips(prev => prev.map(t => (t._id || t.id) === tripId ? data.trip : t));
        setSelectedTrip(data.trip);
      } else {
        showToast(data.message || 'Failed to update trip status', 'error');
      }
    } catch (err) {
      showToast('Failed to update trip status', 'error');
    }
  }, [token, showToast]);

  // Trips: Save / Record Extra Costs (Fuel, Tolls, Wash, etc.)
  const handleSaveExtraCosts = useCallback(async (tripId, extraCosts) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ extraCosts })
      });
      const data = await res.json();

      if (data.success && data.trip) {
        showToast('Extra costs recorded and driver splits updated!');
        setTrips(prev => prev.map(t => (t._id || t.id) === tripId ? data.trip : t));
        setSelectedTrip(data.trip);
        return true;
      } else {
        showToast(data.message || 'Failed to record extra costs', 'error');
        return false;
      }
    } catch {
      showToast('Error recording extra costs', 'error');
      return false;
    }
  }, [token, showToast]);

  // Trips: Save Driver Fare Splits
  const handleSaveSplits = useCallback(async (tripId, splits) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ splits })
      });
      const data = await res.json();

      if (data.success && data.trip) {
        showToast('Driver fare splits updated!');
        setTrips(prev => prev.map(t => (t._id || t.id) === tripId ? data.trip : t));
        setSelectedTrip(data.trip);
        return true;
      } else {
        showToast(data.message || 'Failed to update splits', 'error');
        return false;
      }
    } catch {
      showToast('Error updating splits', 'error');
      return false;
    }
  }, [token, showToast]);

  // Trips: Save Inline Notes
  const handleSaveNotes = useCallback(async (tripId, notesText) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notes: notesText })
      });
      const data = await res.json();

      if (data.success && data.trip) {
        showToast('Trip notes updated (Audit email sent to drivers)!');
        setTrips(prev => prev.map(t => (t._id || t.id) === tripId ? data.trip : t));
        setSelectedTrip(data.trip);
        return true;
      } else {
        showToast(data.message || 'Failed to save notes', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error saving notes', 'error');
      return false;
    }
  }, [token, showToast]);

  // Trips: Defer Trip with Reason (Prohibits Hard Deletion)
  const handleDeferTrip = useCallback(async (trip, reason) => {
    const tripId = trip._id || trip.id;
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'deferred',
          deferReason: reason
        })
      });
      const data = await res.json();

      if (data.success && data.trip) {
        showToast('Trip marked as Cancelled / Paused (Email alert sent to assigned drivers)');
        setTrips(prev => prev.map(t => (t._id || t.id) === tripId ? data.trip : t));
        setSelectedTrip(data.trip);
        return true;
      } else {
        showToast(data.message || 'Failed to update trip status', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error updating trip status', 'error');
      return false;
    }
  }, [token, showToast]);

  // Trips: Create New Trip
  const handleCreateTrip = useCallback(async (tripData) => {
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(tripData)
      });
      const data = await res.json();

      if (data.success && data.trip) {
        showToast('Trip logged successfully!');
        setTrips(prev => [data.trip, ...prev]);
        setActiveModal(null);
        return true;
      } else {
        showToast(data.message || 'Failed to log trip', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error recording trip', 'error');
      return false;
    }
  }, [token, showToast]);

  // Fleet: Register New Car
  const handleAddCar = useCallback(async (carData) => {
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(carData)
      });
      const data = await res.json();

      if (data.success && data.car) {
        showToast('Fleet vehicle added to rotation!');
        setCars(prev => [...prev, data.car]);
        return true;
      } else {
        showToast(data.message || 'Failed to register car', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error registering vehicle', 'error');
      return false;
    }
  }, [token, showToast]);

  // Fleet: Delete Car
  const handleDeleteCar = useCallback(async (carId) => {
    if (!window.confirm('Remove this vehicle from active fleet rotation?')) return;

    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        showToast('Vehicle removed from fleet rotation');
        setCars(prev => prev.filter(c => (c._id || c.id) !== carId));
      } else {
        showToast(data.message || 'Failed to delete vehicle', 'error');
      }
    } catch (err) {
      showToast('Failed to delete vehicle', 'error');
    }
  }, [token, showToast]);

  // Trips: Open Official Tax Invoice Modal / Viewer
  const handlePrintInvoice = useCallback((trip) => {
    const target = trip || selectedTrip;
    if (!target) return;
    setInvoiceTrip(target);
    setActiveModal('tax-invoice');
  }, [selectedTrip]);

  // Filtered & Searched Trips
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // 1. Category Filter
      if (filter === 'take_me_home' && trip.type !== 'take_me_home') return false;
      if (filter === 'chauffeur' && trip.type !== 'chauffeur') return false;
      if (filter === 'completed' && isTripCancelledOrPaused(trip.status)) return false;
      if (filter === 'deferred' && !isTripCancelledOrPaused(trip.status)) return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const client = (trip.clientName || '').toLowerCase();
        const pickup = (trip.pickup || '').toLowerCase();
        const dropoff = (trip.dropoff || '').toLowerCase();
        const clientCar = (trip.clientCar || '').toLowerCase();
        const car = (trip.car || '').toLowerCase();
        const chaseCar = (trip.chaseCar || '').toLowerCase();
        const leadDriver = (trip.clientDriverName || trip.driverName || '').toLowerCase();
        const chaseDriver = (trip.chaseDriverName || '').toLowerCase();
        const deferReason = (trip.deferReason || '').toLowerCase();

        return (
          client.includes(q) ||
          pickup.includes(q) ||
          dropoff.includes(q) ||
          clientCar.includes(q) ||
          car.includes(q) ||
          chaseCar.includes(q) ||
          leadDriver.includes(q) ||
          chaseDriver.includes(q) ||
          deferReason.includes(q)
        );
      }

      return true;
    });
  }, [trips, filter, searchQuery]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/25 animate-pulse">
          🚗
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-black text-white tracking-wide">TAKE ME HOME</h2>
          <p className="text-xs text-amber-400/80 font-mono">Synchronizing Driver Fleet...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated Screen
  if (!user) {
    return (
      <AppShell>
        <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />
        <ToastContainer toasts={toasts} />
      </AppShell>
    );
  }

  // Mandatory First-Login Password Change Screen
  if (user?.mustChangePassword) {
    return (
      <AppShell>
        <MandatoryPasswordChange
          user={user}
          onComplete={handleMandatoryPasswordChange}
          onLogout={handleLogout}
        />
        <ToastContainer toasts={toasts} />
      </AppShell>
    );
  }

  // Main Dashboard View
  return (
    <AppShell>
      {/* 1. Header Navigation Bar */}
      <AppHeader
        user={user}
        onOpenModal={handleOpenModal}
        onLogout={handleLogout}
      />

      {/* 2. Key Performance Metrics (Next Friday Payout & All-Time) */}
      <StatsOverview trips={trips} currentUser={user} />

      {/* 3. Search & Category Filters */}
      <TripFilters
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        trips={trips}
      />

      {/* 4. Responsive Trips Grid */}
      <TripList
        trips={filteredTrips}
        filter={filter}
        searchQuery={searchQuery}
        currentUser={user}
        onSelectTrip={handleSelectTrip}
        onPrintVoucher={handlePrintInvoice}
        onToggleStatus={handleToggleTripStatus}
        onOpenLogModal={handleOpenLogModal}
      />

      {/* 5. Floating Action Button (Log Trip) */}
      <LogTripFAB onOpenLogModal={handleOpenLogModal} />

      {/* 6. Modular Dialogs & Overlays */}
      <TripDetailModal
        trip={selectedTrip}
        currentUser={user}
        onClose={handleCloseDetailModal}
        onPrintInvoice={handlePrintInvoice}
        onToggleStatus={handleToggleTripStatus}
        onDeferTrip={handleDeferTrip}
        onSaveNotes={handleSaveNotes}
        onSaveExtraCosts={handleSaveExtraCosts}
        onSaveSplits={handleSaveSplits}
      />

      <LogTripModal
        isOpen={activeModal === 'log-trip'}
        onClose={handleCloseModal}
        onSubmit={handleCreateTrip}
        cars={cars}
        currentUser={user}
      />

      <FleetModal
        isOpen={activeModal === 'fleet'}
        onClose={handleCloseModal}
        cars={cars}
        onAddCar={handleAddCar}
        onDeleteCar={handleDeleteCar}
      />

      <ProfileModal
        isOpen={activeModal === 'profile'}
        onClose={handleCloseModal}
        currentUser={user}
        onSave={handleUpdateProfile}
        onLogout={handleLogout}
      />

      <TaxInvoiceModal
        isOpen={activeModal === 'tax-invoice'}
        trip={invoiceTrip}
        onClose={handleCloseModal}
      />

      <PopiaModal
        isOpen={activeModal === 'popia'}
        onClose={handleCloseModal}
      />

      <ChangePasswordModal
        isOpen={activeModal === 'change-password'}
        onClose={handleCloseModal}
        onChangePassword={handleChangePassword}
      />

      {/* 7. Toast Alerts */}
      <ToastContainer toasts={toasts} />
    </AppShell>
  );
}
