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
import AuthScreen from '@/components/auth/AuthScreen';
import MandatoryPasswordChange from '@/components/auth/MandatoryPasswordChange';
import { printTripVoucher } from '@/lib/voucher';

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

  // Trips: Toggle Status (In Progress <-> Completed)
  const handleToggleTripStatus = async (trip) => {
    const tripId = trip._id || trip.id;
    const newStatus = trip.status === 'completed' ? 'in_progress' : 'completed';

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

      if (data.success) {
        const label = newStatus === 'completed' ? 'Completed' : 'In Transit';
        showToast(`Trip marked as ${label}`);
        setTrips(prev => prev.map(t => (t._id || t.id) === tripId ? { ...t, status: newStatus } : t));
        if (selectedTrip && (selectedTrip._id || selectedTrip.id) === tripId) {
          setSelectedTrip(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        showToast(data.message || 'Failed to update trip status', 'error');
      }
    } catch (err) {
      showToast('Failed to update trip status', 'error');
    }
  };

  // Trips: Save Inline Notes
  const handleSaveNotes = async (tripId, notesText) => {
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

      if (data.success) {
        showToast('Trip notes updated!');
        setTrips(prev => prev.map(t => (t._id || t.id) === tripId ? { ...t, notes: notesText } : t));
        if (selectedTrip && (selectedTrip._id || selectedTrip.id) === tripId) {
          setSelectedTrip(prev => ({ ...prev, notes: notesText }));
        }
        return true;
      } else {
        showToast(data.message || 'Failed to save notes', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error saving notes', 'error');
      return false;
    }
  };

  // Trips: Delete Trip
  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to permanently delete this trip record?')) return;

    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        showToast('Trip record deleted');
        setTrips(prev => prev.filter(t => (t._id || t.id) !== tripId));
        setActiveModal(null);
        setSelectedTrip(null);
      } else {
        showToast(data.message || 'Failed to delete trip', 'error');
      }
    } catch (err) {
      showToast('Failed to delete trip record', 'error');
    }
  };

  // Trips: Create New Trip
  const handleCreateTrip = async (tripData) => {
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
  };

  // Fleet: Register New Car
  const handleAddCar = async (carData) => {
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
  };

  // Fleet: Delete Car
  const handleDeleteCar = async (carId) => {
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
  };

  // Trips: Print A4 Voucher
  const handlePrintVoucher = (trip) => {
    const target = trip || selectedTrip;
    if (!target) return;
    printTripVoucher(target);
  };

  // Filtered & Searched Trips
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // 1. Category Filter
      if (filter === 'take_me_home' && trip.type !== 'take_me_home') return false;
      if (filter === 'chauffeur' && trip.type !== 'chauffeur') return false;
      if (filter === 'in_progress' && trip.status !== 'in_progress') return false;
      if (filter === 'completed' && trip.status !== 'completed') return false;

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

        return (
          client.includes(q) ||
          pickup.includes(q) ||
          dropoff.includes(q) ||
          clientCar.includes(q) ||
          car.includes(q) ||
          chaseCar.includes(q) ||
          leadDriver.includes(q) ||
          chaseDriver.includes(q)
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
        onOpenModal={(modalId) => setActiveModal(modalId)}
        onLogout={handleLogout}
      />

      {/* 2. Key Performance Metrics */}
      <StatsOverview trips={trips} />

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
        onSelectTrip={(trip) => {
          setSelectedTrip(trip);
          setActiveModal('trip-detail');
        }}
        onPrintVoucher={handlePrintVoucher}
        onToggleStatus={handleToggleTripStatus}
        onOpenLogModal={() => setActiveModal('log-trip')}
      />

      {/* 5. Floating Action Button (Log Trip) */}
      <LogTripFAB onOpenLogModal={() => setActiveModal('log-trip')} />

      {/* 6. Modular Dialogs & Overlays */}
      <TripDetailModal
        trip={selectedTrip}
        onClose={() => {
          setActiveModal(null);
          setSelectedTrip(null);
        }}
        onPrintVoucher={handlePrintVoucher}
        onToggleStatus={handleToggleTripStatus}
        onDeleteTrip={handleDeleteTrip}
        onSaveNotes={handleSaveNotes}
      />

      <LogTripModal
        isOpen={activeModal === 'log-trip'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleCreateTrip}
        cars={cars}
        currentUser={user}
      />

      <FleetModal
        isOpen={activeModal === 'fleet'}
        onClose={() => setActiveModal(null)}
        cars={cars}
        onAddCar={handleAddCar}
        onDeleteCar={handleDeleteCar}
      />

      <ProfileModal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        currentUser={user}
        onSave={handleUpdateProfile}
      />

      <PopiaModal
        isOpen={activeModal === 'popia'}
        onClose={() => setActiveModal(null)}
      />

      <ChangePasswordModal
        isOpen={activeModal === 'change-password'}
        onClose={() => setActiveModal(null)}
        onChangePassword={handleChangePassword}
      />

      {/* 7. Toast Alerts */}
      <ToastContainer toasts={toasts} />
    </AppShell>
  );
}
