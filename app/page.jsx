'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency, formatDate } from '@/lib/helpers';

const AVATAR_COLORS = [
  '#38bdf8', // Cyan
  '#f59e0b', // Gold / Amber
  '#10b981', // Emerald
  '#a855f7', // Purple
  '#f43f5e', // Rose
  '#06b6d4', // Teal
  '#6366f1'  // Indigo
];

export default function Home() {
  // Authentication & User State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Register Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Mandatory / Voluntary Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // App Data
  const [trips, setTrips] = useState([]);
  const [cars, setCars] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals & Popups
  // activeModal: null | 'trip_detail' | 'log_trip' | 'profile' | 'cars' | 'change_password' | 'popia'
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [systemMenuOpen, setSystemMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Profile Editor Form State
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileColor, setProfileColor] = useState('#38bdf8');
  const [profilePicBase64, setProfilePicBase64] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Trip Detail Notes Editing State
  const [isEditingDetailNotes, setIsEditingDetailNotes] = useState(false);
  const [detailNotesText, setDetailNotesText] = useState('');

  // Log Trip Form State
  const [tripType, setTripType] = useState('take_me_home');
  const [tripClientName, setTripClientName] = useState('');
  const [tripClientPhone, setTripClientPhone] = useState('');
  const [tripClientCar, setTripClientCar] = useState('');
  const [tripPickup, setTripPickup] = useState('');
  const [tripDropoff, setTripDropoff] = useState('');
  const [tripClientDriver, setTripClientDriver] = useState('Jabbz');
  const [tripChaseDriver, setTripChaseDriver] = useState('Tebza');
  const [tripChaseCar, setTripChaseCar] = useState('');
  const [tripChauffeurDriver, setTripChauffeurDriver] = useState('Fresh');
  const [tripChauffeurCar, setTripChauffeurCar] = useState('');
  const [tripFare, setTripFare] = useState(450);
  const [tripNotes, setTripNotes] = useState('');
  const [tripSaving, setTripSaving] = useState(false);

  // Manage Cars Form State
  const [newCarName, setNewCarName] = useState('');
  const [newCarModel, setNewCarModel] = useState('');
  const [newCarPlate, setNewCarPlate] = useState('');
  const [newCarColor, setNewCarColor] = useState('Midnight Black');
  const [newCarFuel, setNewCarFuel] = useState(90);
  const [newCarOdometer, setNewCarOdometer] = useState(35000);
  const [carSaving, setCarSaving] = useState(false);

  const menuRef = useRef(null);

  // Toast Dispatcher (Pops from top)
  const showToast = (text, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // Close system menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setSystemMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check stored auth token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('tmh_auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user from API
  const fetchCurrentUser = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        initProfileForm(data.user);
        loadTripsAndCars(authToken);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.warn('Session check failed:', err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // Load Trips & Cars
  const loadTripsAndCars = async (authToken) => {
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
      if (carsData.success) {
        setCars(carsData.cars || []);
        if (carsData.cars && carsData.cars.length > 0) {
          const firstCar = `${carsData.cars[0].name} (${carsData.cars[0].plate})`;
          setTripChaseCar(prev => prev || firstCar);
          setTripChauffeurCar(prev => prev || firstCar);
        }
      }
    } catch (err) {
      showToast('Failed to sync fleet database', 'error');
    }
  };

  // Profile Form Initialization
  const initProfileForm = (u) => {
    if (!u) return;
    setProfileName(u.name || '');
    setProfileEmail(u.email || '');
    setProfilePhone(u.phone || '');
    setProfileColor(u.avatarColor || '#38bdf8');
    setProfilePicBase64(u.profilePic || '');
  };

  // Login Action
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!authEmail || !authPassword) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('tmh_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        initProfileForm(data.user);
        showToast(`Welcome back, ${data.user.name}!`);
        loadTripsAndCars(data.token);
      } else {
        showToast(data.message || 'Login failed', 'error');
      }
    } catch (err) {
      showToast('Network error during authentication', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Quick Preset Helper for Drivers
  const fillPreset = (email, pwd) => {
    setAuthEmail(email);
    setAuthPassword(pwd);
  };

  // Logout Action
  const handleLogout = () => {
    localStorage.removeItem('tmh_auth_token');
    setToken(null);
    setUser(null);
    setTrips([]);
    setCars([]);
    setActiveModal(null);
    setSystemMenuOpen(false);
    showToast('Signed out of fleet portal');
  };

  // Change Password Action
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();

      if (data.success) {
        showToast('Password updated! Your account is now secured.');
        setUser(prev => ({ ...prev, mustChangePassword: false }));
        setActiveModal(null);
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
      } else {
        showToast(data.message || 'Password update failed', 'error');
      }
    } catch (err) {
      showToast('Error updating password', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const payload = {
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        avatarColor: profileColor,
        profilePic: profilePicBase64
      };

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        showToast('Profile updated successfully!');
        setActiveModal(null);
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('Error saving profile changes', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      showToast('Image size exceeds 2.5MB. Please choose a smaller photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePicBase64(event.target.result);
      showToast('Photo loaded! Click Save to apply.');
    };
    reader.readAsDataURL(file);
  };

  // Toggle Trip Status
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
        showToast(`Trip marked as ${newStatus === 'completed' ? 'Completed' : 'In Progress'}`);
        setTrips(prev => prev.map(t => (t._id || t.id) === tripId ? { ...t, status: newStatus } : t));
        if (selectedTrip && (selectedTrip._id || selectedTrip.id) === tripId) {
          setSelectedTrip(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      showToast('Failed to update trip status', 'error');
    }
  };

  // Save Inline Detail Notes
  const handleSaveDetailNotes = async () => {
    if (!selectedTrip) return;
    const tripId = selectedTrip._id || selectedTrip.id;

    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notes: detailNotesText })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Trip notes updated in MongoDB!');
        setTrips(prev => prev.map(t => (t._id || t.id) === tripId ? { ...t, notes: detailNotesText } : t));
        setSelectedTrip(prev => ({ ...prev, notes: detailNotesText }));
        setIsEditingDetailNotes(false);
      }
    } catch (err) {
      showToast('Failed to save notes', 'error');
    }
  };

  // Delete Trip
  const handleDeleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to permanently delete this trip record?')) return;

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
      }
    } catch (err) {
      showToast('Failed to delete trip', 'error');
    }
  };

  // Log New Trip Action
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setTripSaving(true);

    try {
      const payload = {
        type: tripType,
        clientName: tripClientName,
        clientPhone: tripClientPhone,
        clientCar: tripType === 'take_me_home' ? tripClientCar : '',
        pickup: tripPickup,
        dropoff: tripDropoff,
        clientDriverName: tripType === 'take_me_home' ? tripClientDriver : '',
        chaseDriverName: tripType === 'take_me_home' ? tripChaseDriver : '',
        chaseCar: tripType === 'take_me_home' ? tripChaseCar : '',
        driverName: tripType === 'chauffeur' ? tripChauffeurDriver : '',
        car: tripType === 'chauffeur' ? tripChauffeurCar : '',
        fare: Number(tripFare) || 0,
        status: 'completed',
        notes: tripNotes
      };

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.trip) {
        showToast('Trip logged successfully!');
        setTrips(prev => [data.trip, ...prev]);
        setActiveModal(null);
        // Reset form fields
        setTripClientName('');
        setTripClientPhone('');
        setTripClientCar('');
        setTripPickup('');
        setTripDropoff('');
        setTripNotes('');
      } else {
        showToast(data.message || 'Failed to log trip', 'error');
      }
    } catch (err) {
      showToast('Error recording trip', 'error');
    } finally {
      setTripSaving(false);
    }
  };

  // Add Fleet Car Action
  const handleAddCar = async (e) => {
    e.preventDefault();
    setCarSaving(true);
    try {
      const payload = {
        name: newCarName,
        model: newCarModel,
        plate: newCarPlate,
        color: newCarColor,
        fuelPercent: Number(newCarFuel) || 100,
        odometerKm: Number(newCarOdometer) || 0
      };

      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.car) {
        showToast('Fleet car registered successfully!');
        setCars(prev => [...prev, data.car]);
        setNewCarName('');
        setNewCarModel('');
        setNewCarPlate('');
      } else {
        showToast(data.message || 'Failed to register car', 'error');
      }
    } catch (err) {
      showToast('Error adding car', 'error');
    } finally {
      setCarSaving(false);
    }
  };

  // Delete Fleet Car Action
  const handleDeleteCar = async (carId) => {
    if (!confirm('Remove this vehicle from active fleet rotation?')) return;
    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Vehicle removed from fleet');
        setCars(prev => prev.filter(c => (c._id || c.id) !== carId));
      }
    } catch (err) {
      showToast('Failed to delete vehicle', 'error');
    }
  };

  // Print PDF Action - creates clean print document & triggers window.print()
  const handlePrintPDF = (trip) => {
    const t = trip || selectedTrip;
    if (!t) return;

    const printWin = window.open('', '_blank', 'width=800,height=950');
    if (!printWin) {
      window.print();
      return;
    }

    const isTakeMeHome = t.type === 'take_me_home';
    const refCode = `TMH-${(t._id || t.id || '2026').toString().slice(-6).toUpperCase()}`;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voucher_${refCode}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 24px;
            color: #111827;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .voucher-box {
            border: 2px solid #0f172a;
            border-radius: 8px;
            padding: 24px;
            max-width: 680px;
            margin: 0 auto;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 16px;
            margin-bottom: 18px;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .brand-sub {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
          }
          .ref-badge {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 6px 12px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
          }
          .type-banner {
            background: ${isTakeMeHome ? '#fef3c7' : '#e0f2fe'};
            border: 1px solid ${isTakeMeHome ? '#f59e0b' : '#38bdf8'};
            color: ${isTakeMeHome ? '#92400e' : '#0369a1'};
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: 800;
            font-size: 13px;
            text-transform: uppercase;
            margin-bottom: 18px;
            display: flex;
            justify-content: space-between;
          }
          .section-title {
            font-size: 11px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-bottom: 18px;
          }
          .info-cell {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 10px 12px;
            border-radius: 6px;
          }
          .info-cell label {
            display: block;
            font-size: 10px;
            color: #64748b;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .info-cell span {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
          }
          .route-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 18px;
          }
          .route-line {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            font-size: 13px;
          }
          .route-line:last-child { margin-bottom: 0; }
          .route-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
          }
          .dot-pickup { background: #f59e0b; }
          .dot-dropoff { background: #10b981; }
          .fare-card {
            background: #ecfdf5;
            border: 1px solid #10b981;
            padding: 14px 16px;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 18px;
          }
          .fare-lbl { font-size: 13px; font-weight: bold; color: #065f46; }
          .fare-amount { font-size: 22px; font-weight: 900; color: #065f46; font-family: monospace; }
          .notes-box {
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
            padding: 10px 14px;
            border-radius: 0 6px 6px 0;
            margin-bottom: 18px;
            font-size: 12px;
            color: #78350f;
          }
          .footer-note {
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px dashed #cbd5e1;
            padding-top: 12px;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div class="voucher-box">
          <div class="header-row">
            <div>
              <h1 class="brand-title">TAKE ME HOME FLEET</h1>
              <div class="brand-sub">Official Insurance Chauffeur Trip Voucher • POPIA Compliant</div>
            </div>
            <div class="ref-badge">${refCode}</div>
          </div>

          <div class="type-banner">
            <span>${isTakeMeHome ? '🚗 Take Me Home (2 Drivers)' : '🎩 Chauffeur Service'}</span>
            <span>${t.date} • ${t.time}</span>
          </div>

          <div class="section-title">Client & Booking Details</div>
          <div class="info-grid">
            <div class="info-cell">
              <label>CLIENT FULL NAME</label>
              <span>${t.clientName}</span>
            </div>
            <div class="info-cell">
              <label>CLIENT CONTACT PHONE</label>
              <span>${t.clientPhone || 'Confidential'}</span>
            </div>
            ${isTakeMeHome && t.clientCar ? `
              <div class="info-cell" style="grid-column: span 2;">
                <label>CLIENT DRIVEN VEHICLE</label>
                <span>${t.clientCar}</span>
              </div>
            ` : ''}
          </div>

          <div class="section-title">Transit Route Audit</div>
          <div class="route-box">
            <div class="route-line">
              <span class="route-dot dot-pickup"></span>
              <strong>Pickup:</strong> &nbsp; ${t.pickup}
            </div>
            <div class="route-line">
              <span class="route-dot dot-dropoff"></span>
              <strong>Dropoff:</strong> &nbsp; ${t.dropoff}
            </div>
          </div>

          <div class="section-title">Chauffeur Driver Credentials</div>
          <div class="info-grid">
            ${isTakeMeHome ? `
              <div class="info-cell">
                <label>DRIVER 1 (DROVE CLIENT CAR)</label>
                <span>${t.clientDriverName || 'Lead Chauffeur'}</span>
              </div>
              <div class="info-cell">
                <label>DRIVER 2 (ESCORT CHASE CAR)</label>
                <span>${t.chaseDriverName || 'Chase Chauffeur'} (${t.chaseCar || 'Fleet Escort'})</span>
              </div>
            ` : `
              <div class="info-cell">
                <label>CHAUFFEUR DRIVER</label>
                <span>${t.driverName || 'Driver'}</span>
              </div>
              <div class="info-cell">
                <label>COMMERCIAL FLEET CAR</label>
                <span>${t.car || 'Company Fleet'}</span>
              </div>
            `}
          </div>

          ${t.notes ? `
            <div class="section-title">Trip Notes & Audit Log</div>
            <div class="notes-box">
              <strong>Notes:</strong> ${t.notes}
            </div>
          ` : ''}

          <div class="fare-card">
            <span class="fare-lbl">AGREED SERVICE FARE</span>
            <span class="fare-amount">${formatCurrency(t.fare)}</span>
          </div>

          <div class="footer-note">
            Take Me Home Fleet Services • Authorized Service Provider for Insurance Chauffeur Services.<br />
            Data handled in strict adherence to the Protection of Personal Information Act (POPIA Act 4 of 2013).
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // Filtered trips list
  const filteredTrips = trips.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const totalTrips = trips.length;
  const takeMeHomeCount = trips.filter(t => t.type === 'take_me_home').length;
  const chauffeurCount = trips.filter(t => t.type === 'chauffeur').length;
  const totalEarnings = trips.reduce((sum, t) => sum + (Number(t.fare) || 0), 0);

  // 1. Loading State
  if (loading) {
    return (
      <div className="loading-state flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner"></div>
        <p className="text-slate-400 font-medium">Connecting to Take Me Home fleet database...</p>
      </div>
    );
  }

  // 2. Authentication Screen (If Not Signed In)
  if (!user || !token) {
    return (
      <div className="auth-screen animate-fade-in flex items-center justify-center min-h-[85vh] p-4">
        {/* Toast Container */}
        <div id="toast-container" className="fixed top-5 left-4 right-4 z-50 flex flex-col items-center gap-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type} animate-slide-down pointer-events-auto`}>
              <div className="toast-icon">
                {t.type === 'error' ? '⚠️' : '✓'}
              </div>
              <div className="toast-message">{t.text}</div>
            </div>
          ))}
        </div>

        <div className="auth-card w-full max-w-[420px]">
          {/* Header */}
          <div className="auth-header text-center flex flex-col items-center">
            <div className="auth-icon-badge mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <circle cx="17" cy="17" r="2"/>
                <path d="M5 17h10"/>
              </svg>
            </div>
            <h1 className="auth-title text-2xl font-black text-white tracking-tight">Take Me Home</h1>
            <p className="auth-sub text-xs text-slate-400 font-semibold tracking-wide uppercase mt-1">Jabbz • Tebza • Fresh • Fleet Ops</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="auth-mode-tabs grid grid-cols-2 gap-1 bg-slate-900/80 p-1 rounded-xl my-4 border border-white/5">
            <button
              type="button"
              className={`auth-tab ${authMode === 'login' ? 'active' : ''} py-2 text-xs font-bold rounded-lg transition-all`}
              onClick={() => setAuthMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === 'register' ? 'active' : ''} py-2 text-xs font-bold rounded-lg transition-all`}
              onClick={() => setAuthMode('register')}
            >
              Register Driver
            </button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form flex flex-col gap-3.5">
              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-login-email">Email Address *</label>
                <input
                  type="email"
                  id="inp-login-email"
                  className="modal-inp"
                  placeholder="e.g. jabbz@tmh-fleet.co.za"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-field">
                <div className="password-label-row flex justify-between items-center mb-1">
                  <label className="form-lbl m-0" htmlFor="inp-login-pass">Password *</label>
                  <button
                    type="button"
                    className="btn-toggle-pass text-xs font-bold text-cyan-400 hover:text-cyan-300"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="inp-login-pass"
                  className="modal-inp"
                  placeholder="Enter your driver password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Quick Driver Login Presets */}
              <div className="auth-preset-chips flex flex-col gap-1.5 my-1">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Quick Driver Select:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs py-1.5 font-bold hover:border-cyan-400 hover:text-cyan-300 transition-colors"
                    onClick={() => fillPreset('jabbz@tmh-fleet.co.za', 'Jabbz@TMH2026!')}
                  >
                    Jabbz
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs py-1.5 font-bold hover:border-amber-400 hover:text-amber-300 transition-colors"
                    onClick={() => fillPreset('tebza@tmh-fleet.co.za', 'Tebza@TMH2026!')}
                  >
                    Tebza
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs py-1.5 font-bold hover:border-emerald-400 hover:text-emerald-300 transition-colors"
                    onClick={() => fillPreset('fresh@tmh-fleet.co.za', 'Fresh@TMH2026!')}
                  >
                    Fresh
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-gold btn-full btn-glow mt-2 py-3 font-black text-sm tracking-wide"
                disabled={authLoading}
              >
                {authLoading ? 'Verifying Credentials...' : 'Sign In to Driver Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAuthLoading(true);
              try {
                const res = await fetch('/api/auth/profile', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: regName, email: regEmail, phone: regPhone, password: regPassword })
                });
                showToast('Driver account created! Please sign in.');
                setAuthMode('login');
                setAuthEmail(regEmail);
              } catch (err) {
                showToast('Failed to register driver', 'error');
              } finally {
                setAuthLoading(false);
              }
            }} className="auth-form flex flex-col gap-3">
              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-reg-name">Driver Name *</label>
                <input
                  type="text"
                  id="inp-reg-name"
                  className="modal-inp"
                  placeholder="e.g. Neo"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-reg-email">Email Address *</label>
                <input
                  type="email"
                  id="inp-reg-email"
                  className="modal-inp"
                  placeholder="e.g. neo@tmh-fleet.co.za"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-reg-pass">Create Password (min 6 chars) *</label>
                <input
                  type="password"
                  id="inp-reg-pass"
                  className="modal-inp"
                  placeholder="Choose a strong password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-gold btn-full btn-glow mt-2 py-3 font-black text-sm"
                disabled={authLoading}
              >
                {authLoading ? 'Registering...' : 'Register Driver Account'}
              </button>
            </form>
          )}

          <div className="auth-footer mt-4 text-center text-xs text-slate-500 font-medium">
            <span>Dynamic MongoDB Storage • POPIA Compliant</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Mandatory First Login Password Change Screen
  if (user.mustChangePassword) {
    return (
      <div className="auth-screen animate-fade-in flex items-center justify-center min-h-[85vh] p-4">
        {/* Toast Container */}
        <div id="toast-container" className="fixed top-5 left-4 right-4 z-50 flex flex-col items-center gap-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type} animate-slide-down pointer-events-auto`}>
              <div className="toast-icon">
                {t.type === 'error' ? '⚠️' : '✓'}
              </div>
              <div className="toast-message">{t.text}</div>
            </div>
          ))}
        </div>

        <div className="auth-card w-full max-w-[420px]">
          <div className="auth-header text-center flex flex-col items-center">
            <div className="auth-icon-badge icon-badge-gold mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 className="auth-title text-2xl font-black text-white">Mandatory Security Step</h1>
            <p className="auth-sub text-xs text-amber-400 font-bold uppercase tracking-wider mt-1">Set your own private password</p>
          </div>

          <div className="security-alert-box my-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
            <p>
              Welcome, <strong>{user.name}</strong>! To ensure the other drivers cannot access your account or log in as you, you must personalize your private password now before accessing the dashboard.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="auth-form flex flex-col gap-3">
            <div className="form-field">
              <label className="form-lbl" htmlFor="inp-mandatory-new">New Private Password (min 6 characters) *</label>
              <input
                type="password"
                id="inp-mandatory-new"
                className="modal-inp"
                placeholder="Enter your new secret password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-field">
              <label className="form-lbl" htmlFor="inp-mandatory-confirm">Confirm New Password *</label>
              <input
                type="password"
                id="inp-mandatory-confirm"
                className="modal-inp"
                placeholder="Confirm your new secret password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-gold btn-full btn-glow mt-2 py-3 font-black text-sm"
              disabled={pwLoading}
            >
              {pwLoading ? 'Securing Account...' : 'Set My Private Password & Enter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4. Main Authenticated Dashboard Screen (RESPONSIVE TO ALL SCREEN SIZES)
  return (
    <div className="mobile-dashboard animate-fade-in flex flex-col gap-5 p-4 sm:p-6 lg:p-8 pb-28">
      {/* Toast Notifications (Pops at the top) */}
      <div id="toast-container" className="fixed top-5 left-4 right-4 z-50 flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type} animate-slide-down pointer-events-auto`}>
            <div className="toast-icon">
              {t.type === 'error' ? '⚠️' : '✓'}
            </div>
            <div className="toast-message">{t.text}</div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          RESPONSIVE TOP BAR (MOBILE & PC)
          ========================================================================= */}
      <header className="mobile-top-bar flex items-center justify-between pb-4 border-b border-white/10 relative">
        {/* User Profile (Tap to Edit) */}
        <div
          className="user-profile-badge flex items-center gap-3.5 cursor-pointer p-1.5 rounded-2xl hover:bg-white/5 active:scale-95 transition-all select-none"
          onClick={() => {
            initProfileForm(user);
            setActiveModal('profile');
          }}
          title="Tap to update profile, email, phone & picture"
        >
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt={user.name}
              className="user-avatar-img w-12 h-12 rounded-full object-cover border-2 border-cyan-400 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-500/20"
            />
          ) : (
            <span
              className="user-avatar w-12 h-12 rounded-full font-black text-lg flex items-center justify-center text-slate-950 shadow-lg"
              style={{ background: user?.avatarColor || '#38bdf8' }}
            >
              {user ? user.name.charAt(0).toUpperCase() : 'J'}
            </span>
          )}
          <div className="user-names flex flex-col">
            <div className="user-name-title-row flex items-center gap-2">
              <span className="greeting-name font-black text-lg sm:text-xl text-white tracking-tight">{user ? user.name : 'Driver'}</span>
              <span className="admin-badge-mini uppercase text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Admin
              </span>
            </div>
            <span className="greeting-sub text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online • Tap for Profile
            </span>
          </div>
        </div>

        {/* Action Controls: Fleet & Menu */}
        <div className="top-bar-actions flex items-center gap-2.5" ref={menuRef}>
          <button
            type="button"
            className="btn-manage-cars flex items-center gap-2 px-3.5 py-2 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 text-xs font-bold hover:bg-cyan-500/25 hover:scale-105 active:scale-95 transition-all shadow-sm"
            onClick={() => setActiveModal('cars')}
            title="Manage Fleet (Polo, Fiesta, i20)"
          >
            <span className="text-sm">🚗</span>
            <span>Fleet</span>
          </button>
          <button
            type="button"
            className="btn-menu-icon w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-white/15 hover:rotate-30 active:scale-90 transition-all shadow-sm"
            onClick={() => setSystemMenuOpen(prev => !prev)}
            title="Menu & Settings"
          >
            <span>⚙️</span>
          </button>

          {/* DROPDOWN QUICK MENU */}
          {systemMenuOpen && (
            <div id="quick-system-menu" className="system-menu-dropdown absolute top-16 right-0 w-64 bg-slate-900/98 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
              <div
                className="menu-item flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => {
                  initProfileForm(user);
                  setActiveModal('profile');
                  setSystemMenuOpen(false);
                }}
              >
                <span className="menu-icon text-lg">👤</span>
                <div className="menu-text flex flex-col">
                  <strong className="text-sm font-bold text-white">My Driver Profile</strong>
                  <small className="text-xs text-slate-400">Update name, email, phone & picture</small>
                </div>
              </div>

              <div
                className="menu-item flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => {
                  setActiveModal('cars');
                  setSystemMenuOpen(false);
                }}
              >
                <span className="menu-icon text-lg">🚗</span>
                <div className="menu-text flex flex-col">
                  <strong className="text-sm font-bold text-white">Fleet Management</strong>
                  <small className="text-xs text-slate-400">Manage Polo, Fiesta, i20 & rotation</small>
                </div>
              </div>

              <div
                className="menu-item flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => {
                  setActiveModal('popia');
                  setSystemMenuOpen(false);
                }}
              >
                <span className="menu-icon text-lg">🛡️</span>
                <div className="menu-text flex flex-col">
                  <strong className="text-sm font-bold text-white">POPIA Compliance</strong>
                  <small className="text-xs text-slate-400">Act 4 of 2013 data protection audit</small>
                </div>
              </div>

              <div
                className="menu-item flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => {
                  setActiveModal('change_password');
                  setSystemMenuOpen(false);
                }}
              >
                <span className="menu-icon text-lg">🔑</span>
                <div className="menu-text flex flex-col">
                  <strong className="text-sm font-bold text-white">Change Password</strong>
                  <small className="text-xs text-slate-400">Update private secret password</small>
                </div>
              </div>

              <div className="menu-divider h-px bg-white/10 my-1"></div>

              <div
                className="menu-item menu-logout flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-500/20 cursor-pointer transition-colors"
                onClick={handleLogout}
              >
                <span className="menu-icon text-lg">🚪</span>
                <div className="menu-text flex flex-col">
                  <strong className="text-sm font-bold text-rose-400">Sign Out</strong>
                  <small className="text-xs text-rose-300/70">End active chauffeur session</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* QUICK STATS TILES (RESPONSIVE 2X2 ON MOBILE, 4 TILES HORIZONTAL ON DESKTOP) */}
      <section className="mobile-stats-row grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-tile flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-white/5 text-center hover:border-slate-600 transition-colors">
          <span className="stat-count text-2xl sm:text-3xl font-black text-white">{totalTrips}</span>
          <span className="stat-name text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">All Trips</span>
        </div>

        <div className="stat-tile tile-gold flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-center hover:border-amber-400 transition-colors">
          <span className="stat-count text-2xl sm:text-3xl font-black text-amber-400">{takeMeHomeCount}</span>
          <span className="stat-name text-xs text-amber-200/90 font-bold mt-1">Take Me Home<br /><small className="text-[10px] opacity-80">(2 Drivers)</small></span>
        </div>

        <div className="stat-tile tile-cyan flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-center hover:border-cyan-400 transition-colors">
          <span className="stat-count text-2xl sm:text-3xl font-black text-cyan-400">{chauffeurCount}</span>
          <span className="stat-name text-xs text-cyan-200/90 font-bold mt-1">Chauffeur<br /><small className="text-[10px] opacity-80">(1 Driver)</small></span>
        </div>

        <div className="stat-tile tile-emerald flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center hover:border-emerald-400 transition-colors">
          <span className="stat-count text-xl sm:text-2xl font-black font-mono text-emerald-400">{formatCurrency(totalEarnings)}</span>
          <span className="stat-name text-xs text-emerald-200/90 font-bold mt-1 uppercase tracking-wider">Total Fares</span>
        </div>
      </section>

      {/* FILTER TABS */}
      <div className="mobile-filter-tabs flex gap-2.5 overflow-x-auto pb-1">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''} px-4 py-2 rounded-xl text-xs font-black tracking-wide whitespace-nowrap transition-all flex items-center gap-2`}
          onClick={() => setFilter('all')}
        >
          <span>All Trips</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10">{totalTrips}</span>
        </button>
        <button
          className={`filter-tab ${filter === 'take_me_home' ? 'active' : ''} px-4 py-2 rounded-xl text-xs font-black tracking-wide whitespace-nowrap transition-all flex items-center gap-2`}
          onClick={() => setFilter('take_me_home')}
        >
          <span>🚗 Take Me Home</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300">{takeMeHomeCount}</span>
        </button>
        <button
          className={`filter-tab ${filter === 'chauffeur' ? 'active' : ''} px-4 py-2 rounded-xl text-xs font-black tracking-wide whitespace-nowrap transition-all flex items-center gap-2`}
          onClick={() => setFilter('chauffeur')}
        >
          <span>🎩 Chauffeur</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300">{chauffeurCount}</span>
        </button>
      </div>

      {/* =========================================================================
          DECLUTTERED TRIP CARDS (RESPONSIVE GRID: 1 COL MOBILE, 2/3 COLS ON PC)
          ========================================================================= */}
      <section className="mobile-trip-list grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredTrips.length === 0 ? (
          <div className="mobile-empty-card col-span-full p-8 rounded-3xl bg-slate-900/60 border border-dashed border-white/15 text-center flex flex-col items-center gap-3">
            <p className="text-slate-400 font-medium">No {filter === 'all' ? '' : filter.replace('_', ' ')} trips found in database.</p>
            <button
              className="btn btn-gold btn-sm px-5 py-2.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform"
              onClick={() => setActiveModal('log_trip')}
            >
              + Log First Trip
            </button>
          </div>
        ) : (
          filteredTrips.map(trip => {
            const isTakeMeHome = trip.type === 'take_me_home';
            const tripId = trip._id || trip.id;
            const isDone = trip.status === 'completed';

            return (
              <article
                key={tripId}
                className={`compact-trip-card bg-slate-900/75 backdrop-blur-xl border rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 cursor-pointer relative overflow-hidden group select-none hover:shadow-xl hover:shadow-black/40 ${
                  isDone 
                    ? 'border-white/10 hover:border-emerald-500/40 hover:bg-slate-900/90' 
                    : 'border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-amber-950/20 hover:border-amber-400/50 shadow-lg shadow-amber-500/5'
                }`}
                onClick={() => {
                  setSelectedTrip(trip);
                  setDetailNotesText(trip.notes || '');
                  setIsEditingDetailNotes(false);
                  setActiveModal('trip_detail');
                }}
              >
                {/* 1. Header: Service Chip, Status Pill, Timestamp */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
                      isTakeMeHome
                        ? 'bg-amber-400/10 text-amber-300 border border-amber-400/25'
                        : 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/25'
                    }`}>
                      {isTakeMeHome ? '🚗 Take Me Home' : '🎩 Chauffeur'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Refined status badge that looks gorgeous on mobile without chaotic animation */}
                    {isDone ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
                          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                        </svg>
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/25">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                        <span>In Transit</span>
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-slate-400">{trip.time}</span>
                  </div>
                </div>

                {/* 2. Client & Fare */}
                <div className="flex items-start justify-between gap-3 pt-0.5">
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors tracking-tight truncate">
                      {trip.clientName}
                    </h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      {isTakeMeHome && trip.clientCar ? (
                        <span className="text-amber-300/90 font-medium truncate">Client Car: {trip.clientCar}</span>
                      ) : trip.car ? (
                        <span className="text-cyan-300/90 font-medium truncate">Fleet: {trip.car}</span>
                      ) : (
                        <span className="text-slate-500">Private Booking</span>
                      )}
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl font-black font-mono text-emerald-400 shrink-0">
                    {formatCurrency(trip.fare)}
                  </div>
                </div>

                {/* 3. Decluttered Route Timeline */}
                <div className="flex flex-col gap-1.5 py-1 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]"></span>
                    <span className="truncate font-medium text-slate-200">{trip.pickup}</span>
                  </div>
                  <div className="w-0.5 h-2 bg-white/15 ml-[3.5px] -my-0.5"></div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.6)]"></span>
                    <span className="truncate font-medium text-slate-200">{trip.dropoff}</span>
                  </div>
                </div>

                {/* 4. Desktop-Enhanced Details: Escort Vehicle, Client Phone, Notes Preview */}
                <div className="hidden sm:flex flex-col gap-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    {isTakeMeHome && trip.chaseCar && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-slate-300">
                        <span className="text-amber-300 font-bold">Escort:</span>
                        <span className="font-mono">{trip.chaseCar}</span>
                      </span>
                    )}
                    {trip.clientPhone && (
                      <a
                        href={`tel:${trip.clientPhone}`}
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                      >
                        <span>📞 {trip.clientPhone}</span>
                      </a>
                    )}
                  </div>

                  {trip.notes && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-1 bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
                      "{trip.notes}"
                    </p>
                  )}
                </div>

                {/* 5. Footer: Drivers & Action Row */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[65%] sm:max-w-[55%]">
                    <span className="text-xs text-amber-400 shrink-0">👤</span>
                    <span className="truncate font-medium text-slate-300">
                      {isTakeMeHome
                        ? `${trip.clientDriverName || 'Lead'} & ${trip.chaseDriverName || 'Chase'}`
                        : `${trip.driverName || 'Driver'}`}
                    </span>
                  </div>

                  {/* Quick Action buttons on PC / Details hint on Mobile */}
                  <div className="flex items-center gap-1.5">
                    <div className="hidden sm:flex items-center gap-1.5 mr-1" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs px-2.5 py-1 text-[11px] font-bold rounded-lg hover:bg-white/15"
                        onClick={() => handlePrintPDF(trip)}
                        title="Print Official PDF Voucher"
                      >
                        <span>🖨️ Voucher</span>
                      </button>
                      <button
                        type="button"
                        className={`btn ${isDone ? 'btn-secondary' : 'btn-emerald'} btn-xs px-2.5 py-1 text-[11px] font-bold rounded-lg`}
                        onClick={() => handleToggleTripStatus(trip)}
                        title={isDone ? 'Reopen Trip' : 'Mark Completed'}
                      >
                        <span>{isDone ? 'Reopen' : '✓ Done'}</span>
                      </button>
                    </div>

                    <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all">
                      Details ›
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* MOBILE FLOATING ACTION BUTTON (LOG TRIP) */}
      <div className="mobile-fab-container fixed bottom-6 right-6 z-40">
        <button
          type="button"
          className="btn-fab-log shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm"
          onClick={() => setActiveModal('log_trip')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Log Trip</span>
        </button>
      </div>

      {/* =========================================================================
          DEDICATED TRIP DETAIL MODAL (FIXED HEADER & FOOTER, NO CLIPPING AT TOP/BOTTOM)
          ========================================================================= */}
      {activeModal === 'trip_detail' && selectedTrip && (
        <div className="modal-backdrop fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in" onClick={() => setActiveModal(null)}>
          <div
            className="trip-detail-dialog-card w-full max-w-[540px] md:max-w-3xl lg:max-w-4xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col bg-slate-900 border border-white/15 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* 1. STICKY TOP NAVIGATION (NEVER CUTS OFF AT THE TOP) */}
            <div className="sticky top-0 z-30 bg-slate-900/98 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
              <button
                type="button"
                className="btn-back-link flex items-center gap-1.5 text-slate-400 hover:text-white text-xs sm:text-sm font-bold transition-colors"
                onClick={() => setActiveModal(null)}
              >
                <span className="back-arrow text-base">←</span>
                <span>Back to Trips</span>
              </button>
              <div className="detail-header-right flex items-center gap-2.5">
                <span className={`status-pill status-${selectedTrip.status}`}>
                  {selectedTrip.status === 'completed' ? '✓ Completed' : '● In Transit'}
                </span>
                <button
                  type="button"
                  className="modal-close w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-all"
                  onClick={() => setActiveModal(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 2. SCROLLABLE BODY (RESPONSIVE: 1-COLUMN MOBILE, 2-COLUMN DESKTOP) */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Column: Hero Banner + Route */}
                <div className="flex flex-col gap-4">
                  {/* Hero Header */}
                  <div className={`detail-hero-banner p-4 sm:p-5 rounded-2xl flex flex-col gap-2.5 ${selectedTrip.type === 'take_me_home' ? 'hero-tmh' : 'hero-chauffeur'}`}>
                    <div className="hero-type-row flex items-center justify-between text-xs font-mono">
                      <span className="type-tag font-black">
                        {selectedTrip.type === 'take_me_home' ? '🚗 TAKE ME HOME' : '🎩 CHAUFFEUR'}
                      </span>
                      <span className="detail-time-tag opacity-80">{selectedTrip.date} • {selectedTrip.time}</span>
                    </div>
                    <h2 className="detail-client-name text-2xl sm:text-3xl font-black text-white tracking-tight">{selectedTrip.clientName}</h2>
                    {selectedTrip.clientPhone && (
                      <a href={`tel:${selectedTrip.clientPhone}`} className="detail-phone-btn inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold w-fit hover:scale-105 transition-transform">
                        <span>📞 Call {selectedTrip.clientPhone}</span>
                      </a>
                    )}
                    {selectedTrip.type === 'take_me_home' && selectedTrip.clientCar && (
                      <div className="detail-client-car-badge text-xs px-3 py-1.5 rounded-lg w-fit">
                        <span>Client Car: <strong>{selectedTrip.clientCar}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Transit Route Flow */}
                  <div className="detail-section-box p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2.5">
                    <span className="section-micro-lbl text-[11px] font-bold text-slate-400 uppercase tracking-wider">TRANSIT ROUTE</span>
                    <div className="detail-route-flow flex flex-col gap-1.5 pl-1">
                      <div className="route-step flex items-start gap-3">
                        <span className="route-marker pickup-marker w-3.5 h-3.5 rounded-full mt-1 shrink-0 bg-amber-400 shadow-md shadow-amber-500/50"></span>
                        <div>
                          <span className="route-lbl text-[10px] font-bold text-slate-400 uppercase tracking-wide">PICKUP VENUE</span>
                          <p className="route-addr text-sm font-semibold text-white mt-0.5">{selectedTrip.pickup}</p>
                        </div>
                      </div>
                      <div className="route-step-line w-0.5 h-5 bg-white/20 ml-1.5 my-0.5"></div>
                      <div className="route-step flex items-start gap-3">
                        <span className="route-marker dropoff-marker w-3.5 h-3.5 rounded-full mt-1 shrink-0 bg-emerald-400 shadow-md shadow-emerald-500/50"></span>
                        <div>
                          <span className="route-lbl text-[10px] font-bold text-slate-400 uppercase tracking-wide">DESTINATION</span>
                          <p className="route-addr text-sm font-semibold text-white mt-0.5">{selectedTrip.dropoff}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Drivers Audit + Notes + Fare */}
                <div className="flex flex-col gap-4">
                  {/* Who Done It Section */}
                  <div className="detail-section-box who-box-accent p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-3">
                    <div className="section-title-row flex items-center justify-between">
                      <span className="section-micro-lbl text-[11px] font-bold text-slate-400 uppercase tracking-wider">WHO DONE THIS TRIP</span>
                      <span className="who-count-badge text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {selectedTrip.type === 'take_me_home' ? '2 Drivers Dispatched' : '1 Driver Dispatched'}
                      </span>
                    </div>

                    {selectedTrip.type === 'take_me_home' ? (
                      <div className="detail-dual-drivers grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="detail-driver-item flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                          <div className="driver-num-badge w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 bg-amber-400 text-slate-950 shadow-sm">1</div>
                          <div className="flex flex-col">
                            <span className="driver-role-title text-[10px] text-slate-400 font-bold uppercase">Drove Client Car</span>
                            <strong className="driver-name-highlight text-sm text-white">{selectedTrip.clientDriverName || 'Lead Driver'}</strong>
                          </div>
                        </div>

                        <div className="detail-driver-item flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                          <div className="driver-num-badge badge-chase w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 bg-cyan-400 text-slate-950 shadow-sm">2</div>
                          <div className="flex flex-col">
                            <span className="driver-role-title text-[10px] text-slate-400 font-bold uppercase">Drove Escort Car</span>
                            <strong className="driver-name-highlight text-sm text-white">{selectedTrip.chaseDriverName || 'Chase Driver'}</strong>
                            <small className="chase-car-text text-xs text-amber-300 font-mono mt-0.5">{selectedTrip.chaseCar || 'Fleet Escort'}</small>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="detail-driver-item flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                        <div className="driver-num-badge w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 bg-cyan-400 text-slate-950 shadow-sm">🎩</div>
                        <div className="flex flex-col">
                          <span className="driver-role-title text-[10px] text-slate-400 font-bold uppercase">Chauffeur Driver</span>
                          <strong className="driver-name-highlight text-sm text-white">{selectedTrip.driverName || 'Driver'}</strong>
                          <small className="chase-car-text text-xs text-amber-300 font-mono mt-0.5">Fleet: {selectedTrip.car || 'Company Fleet'}</small>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prominent Trip Notes with Live Edit */}
                  <div className="detail-section-box notes-box-gold p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2">
                    <div className="section-title-row flex items-center justify-between">
                      <span className="section-micro-lbl text-[11px] font-bold text-slate-400 uppercase tracking-wider">📝 TRIP NOTES & INSTRUCTIONS</span>
                      <button
                        type="button"
                        className="btn-text-edit text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
                        onClick={() => setIsEditingDetailNotes(prev => !prev)}
                      >
                        {isEditingDetailNotes ? 'Cancel' : 'Edit Notes'}
                      </button>
                    </div>

                    {!isEditingDetailNotes ? (
                      <p className="detail-notes-text text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedTrip.notes && selectedTrip.notes.trim() ? (
                          selectedTrip.notes
                        ) : (
                          <em className="text-slate-500">No notes recorded for this trip yet.</em>
                        )}
                      </p>
                    ) : (
                      <div className="edit-notes-form flex flex-col gap-2 mt-1">
                        <textarea
                          className="modal-inp text-xs p-2.5 rounded-xl"
                          rows={3}
                          value={detailNotesText}
                          onChange={e => setDetailNotesText(e.target.value)}
                          placeholder="Enter gate codes, key handover info, etc..."
                        />
                        <div className="edit-notes-actions flex justify-end gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs px-3 py-1.5"
                            onClick={() => setIsEditingDetailNotes(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-gold btn-xs px-3 py-1.5 font-bold"
                            onClick={handleSaveDetailNotes}
                          >
                            Save Notes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fare & Financials */}
                  <div className="detail-fare-card flex items-center justify-between p-4 rounded-2xl">
                    <span className="fare-card-lbl text-xs font-bold uppercase tracking-wider">Agreed Service Fare</span>
                    <span className="fare-card-val text-2xl font-black font-mono">{formatCurrency(selectedTrip.fare)}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. STICKY BOTTOM ACTIONS (ALWAYS PINNED, NEVER CUTS OFF AT THE BOTTOM) */}
            <div className="sticky bottom-0 z-30 bg-slate-900/98 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 border-t border-white/10 flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                type="button"
                className="btn btn-gold btn-glow flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/25 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                onClick={() => handlePrintPDF(selectedTrip)}
              >
                <span>🖨️ Print Official PDF Voucher</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`btn ${selectedTrip.status === 'completed' ? 'btn-secondary' : 'btn-emerald'} flex-1 sm:flex-none py-3 px-5 rounded-xl font-bold text-xs active:scale-[0.97] transition-all shrink-0`}
                  onClick={() => handleToggleTripStatus(selectedTrip)}
                >
                  <span>{selectedTrip.status === 'completed' ? 'Mark In Transit' : '✓ Mark Completed'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-danger-outline py-3 px-4 rounded-xl flex items-center justify-center text-sm active:scale-[0.95] transition-all shrink-0"
                  onClick={() => handleDeleteTrip(selectedTrip._id || selectedTrip.id)}
                  title="Delete Trip Record"
                >
                  🗑️
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          DRIVER PROFILE MODAL (NAME, EMAIL, NUMBER, PIC, COLOR THEME)
          ========================================================================= */}
      {activeModal === 'profile' && (
        <div className="modal-backdrop fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card w-full max-w-[460px] my-auto p-5 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar flex items-center justify-between pb-3 border-b border-white/10 mb-4 shrink-0">
              <div>
                <h2 className="modal-heading text-lg font-black text-white">Driver Profile</h2>
                <small className="text-gold text-xs font-semibold">Admin Chauffeur Credentials</small>
              </div>
              <button
                type="button"
                className="modal-close w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form flex-1 min-h-0 overflow-y-auto flex flex-col gap-3.5 pr-1">
              {/* Profile Avatar Preview & Upload */}
              <div className="profile-pic-section flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div
                  className="profile-avatar-preview w-16 h-16 rounded-full flex items-center justify-center overflow-hidden shrink-0 border-2 border-amber-400 shadow-lg shadow-amber-500/20"
                  style={{
                    background: profilePicBase64 ? 'transparent' : profileColor
                  }}
                >
                  {profilePicBase64 ? (
                    <img src={profilePicBase64} alt="Profile" className="avatar-img-preview w-full h-full object-cover" />
                  ) : (
                    <span className="avatar-letter-preview text-2xl font-black text-slate-950">
                      {(profileName || 'D').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="profile-pic-controls flex flex-col gap-1.5">
                  <label className="btn btn-secondary btn-xs py-1.5 px-3 rounded-lg cursor-pointer w-fit font-bold hover:scale-105 active:scale-95 transition-all" htmlFor="inp-avatar-upload">
                    <span>📸 Upload Photo</span>
                  </label>
                  <input
                    type="file"
                    id="inp-avatar-upload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                  />
                  {profilePicBase64 && (
                    <button
                      type="button"
                      className="btn-clear-photo text-xs text-rose-400 hover:underline text-left font-semibold"
                      onClick={() => setProfilePicBase64('')}
                    >
                      Remove Photo
                    </button>
                  )}
                  <small className="text-muted text-[11px] text-slate-400">Max 2.5MB (JPG, PNG, WebP)</small>
                </div>
              </div>

              {/* Avatar Theme Color Selector */}
              <div className="form-field flex flex-col gap-1">
                <label className="form-lbl text-xs font-bold text-slate-300">Avatar Color Theme</label>
                <div className="color-palette-row flex items-center gap-2.5 py-1">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`color-dot w-7 h-7 rounded-full transition-all ${profileColor.toLowerCase() === c.toLowerCase() ? 'selected-color scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-md' : 'hover:scale-105'}`}
                      style={{ background: c }}
                      onClick={() => setProfileColor(c)}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Driver Name */}
              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-edit-name">Full Driver Name *</label>
                <input
                  type="text"
                  id="inp-edit-name"
                  className="modal-inp text-xs"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="e.g. Jabbz"
                  required
                />
              </div>

              {/* Email */}
              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-edit-email">Email Address *</label>
                <input
                  type="email"
                  id="inp-edit-email"
                  className="modal-inp text-xs"
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                  placeholder="e.g. jabbz@tmh-fleet.co.za"
                  required
                />
              </div>

              {/* Phone */}
              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-edit-phone">Mobile Contact Number</label>
                <input
                  type="tel"
                  id="inp-edit-phone"
                  className="modal-inp text-xs"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  placeholder="e.g. +27 82 450 1198"
                />
              </div>

              {/* Admin Callout */}
              <div className="admin-profile-callout p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                <span className="callout-shield text-xl shrink-0">🛡️</span>
                <div className="text-xs">
                  <strong className="text-amber-300 font-bold block mb-0.5">Full Admin Powers Enabled</strong>
                  <p className="text-slate-300 leading-tight">Role: Admin Chauffeur • Full rights over fleet rotation, dispatches, audits & POPIA.</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions grid grid-cols-2 gap-2 pt-2 mt-auto shrink-0">
                <button
                  type="button"
                  className="btn btn-secondary btn-full py-2.5 rounded-xl font-bold text-xs"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-full btn-glow py-2.5 rounded-xl font-black text-xs"
                  disabled={profileSaving}
                >
                  {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          LOG NEW TRIP MODAL
          ========================================================================= */}
      {activeModal === 'log_trip' && (
        <div className="modal-backdrop fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card w-full max-w-[500px] my-auto p-5 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
              <div>
                <h2 className="modal-heading text-lg font-black text-white">Log New Service Trip</h2>
                <small className="text-gold text-xs font-semibold">Take Me Home (2 Drivers) or Chauffeur (1 Driver)</small>
              </div>
              <button
                type="button"
                className="modal-close w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            {/* Segmented Type Switcher */}
            <div className="type-segmented-control grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-white/10 mb-3 shrink-0">
              <button
                type="button"
                className={`seg-btn ${tripType === 'take_me_home' ? 'active' : ''} p-2.5 rounded-xl flex flex-col items-center justify-center transition-all`}
                onClick={() => {
                  setTripType('take_me_home');
                  setTripFare(450);
                }}
              >
                <span className="font-black text-xs">🚗 Take Me Home</span>
                <small className="text-[10px] text-slate-400 mt-0.5">(2 Drivers Dispatched)</small>
              </button>
              <button
                type="button"
                className={`seg-btn ${tripType === 'chauffeur' ? 'active' : ''} p-2.5 rounded-xl flex flex-col items-center justify-center transition-all`}
                onClick={() => {
                  setTripType('chauffeur');
                  setTripFare(550);
                }}
              >
                <span className="font-black text-xs">🎩 Chauffeur</span>
                <small className="text-[10px] text-slate-400 mt-0.5">(1 Driver Dispatched)</small>
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="modal-form flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
              {/* Callout hint */}
              <div className={`form-callout-hint p-2.5 rounded-xl flex items-center gap-2 text-xs leading-tight ${tripType === 'take_me_home' ? 'bg-amber-500/10 border border-amber-500/25 text-amber-200' : 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-200'}`}>
                <span className="text-base">{tripType === 'take_me_home' ? '💡' : '🎩'}</span>
                <span>
                  {tripType === 'take_me_home'
                    ? 'Drive client in their car. Requires 2 drivers (Lead Driver + Chase Escort Car).'
                    : 'Transporting client using our company fleet car (1 driver dispatched).'}
                </span>
              </div>

              {/* Drivers & Vehicle Assignment */}
              {tripType === 'take_me_home' ? (
                <>
                  <div className="two-drivers-selector-box p-3 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-2.5">
                    <span className="box-title text-[11px] font-black text-amber-400 uppercase tracking-wider">ASSIGN THE 2 DRIVERS (WHO DONE THIS):</span>

                    <div className="form-field">
                      <label className="form-lbl text-xs font-bold">Driver 1: Drove Client's Car *</label>
                      <select
                        className="modal-select text-xs"
                        value={tripClientDriver}
                        onChange={e => setTripClientDriver(e.target.value)}
                      >
                        <option value="Jabbz">Jabbz (Client Car Chauffeur)</option>
                        <option value="Tebza">Tebza (Client Car Chauffeur)</option>
                        <option value="Fresh">Fresh (Client Car Chauffeur)</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label className="form-lbl text-xs font-bold">Driver 2: Drove Chase Escort Car *</label>
                      <select
                        className="modal-select text-xs"
                        value={tripChaseDriver}
                        onChange={e => setTripChaseDriver(e.target.value)}
                      >
                        <option value="Tebza">Tebza (Chase Car Escort)</option>
                        <option value="Jabbz">Jabbz (Chase Car Escort)</option>
                        <option value="Fresh">Fresh (Chase Car Escort)</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label className="form-lbl text-xs font-bold">Our Fleet Chase Vehicle *</label>
                      <select
                        className="modal-select text-xs"
                        value={tripChaseCar}
                        onChange={e => setTripChaseCar(e.target.value)}
                      >
                        {cars.map(c => (
                          <option key={c._id || c.id} value={`${c.name} (${c.plate})`}>
                            {c.name} ({c.plate})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-lbl text-xs font-bold" htmlFor="inp-client-car">Client's Vehicle Model *</label>
                    <input
                      type="text"
                      id="inp-client-car"
                      className="modal-inp text-xs"
                      placeholder="e.g. Audi Q7 or BMW X3"
                      value={tripClientCar}
                      onChange={e => setTripClientCar(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="two-drivers-selector-box p-3 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-2.5">
                  <span className="box-title text-[11px] font-black text-cyan-400 uppercase tracking-wider">CHAUFFEUR DRIVER & FLEET CAR:</span>
                  <div className="form-field">
                    <label className="form-lbl text-xs font-bold">Chauffeur Driver *</label>
                    <select
                      className="modal-select text-xs"
                      value={tripChauffeurDriver}
                      onChange={e => setTripChauffeurDriver(e.target.value)}
                    >
                      <option value="Fresh">Fresh</option>
                      <option value="Jabbz">Jabbz</option>
                      <option value="Tebza">Tebza</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-lbl text-xs font-bold">Commercial Fleet Vehicle *</label>
                    <select
                      className="modal-select text-xs"
                      value={tripChauffeurCar}
                      onChange={e => setTripChauffeurCar(e.target.value)}
                    >
                      {cars.map(c => (
                        <option key={c._id || c.id} value={`${c.name} (${c.plate})`}>
                          {c.name} ({c.plate})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Client Info */}
              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-log-client">Client / Passenger Name *</label>
                <input
                  type="text"
                  id="inp-log-client"
                  className="modal-inp text-xs"
                  placeholder="e.g. Dr. Michael Ndlovu"
                  value={tripClientName}
                  onChange={e => setTripClientName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-log-phone">Client Contact Number</label>
                <input
                  type="tel"
                  id="inp-log-phone"
                  className="modal-inp text-xs"
                  placeholder="e.g. +27 83 291 0041"
                  value={tripClientPhone}
                  onChange={e => setTripClientPhone(e.target.value)}
                />
              </div>

              {/* Route */}
              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-log-pickup">Pickup Address / Venue *</label>
                <input
                  type="text"
                  id="inp-log-pickup"
                  className="modal-inp text-xs"
                  placeholder="e.g. The Grillhouse, Rosebank Mall"
                  value={tripPickup}
                  onChange={e => setTripPickup(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-log-dropoff">Destination / Dropoff Address *</label>
                <input
                  type="text"
                  id="inp-log-dropoff"
                  className="modal-inp text-xs"
                  placeholder="e.g. 42 Cumberland Ave, Bryanston"
                  value={tripDropoff}
                  onChange={e => setTripDropoff(e.target.value)}
                  required
                />
              </div>

              {/* Fare & Notes */}
              <div className="grid grid-cols-2 gap-2">
                <div className="form-field">
                  <label className="form-lbl text-xs font-bold" htmlFor="inp-log-fare">Agreed Fare (ZAR) *</label>
                  <input
                    type="number"
                    id="inp-log-fare"
                    className="modal-inp text-xs font-mono font-bold text-emerald-400"
                    value={tripFare}
                    onChange={e => setTripFare(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-lbl text-xs font-bold">Status</label>
                  <select className="modal-select text-xs">
                    <option value="completed">✓ Completed</option>
                    <option value="in_progress">● Currently on Road</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-log-notes">📝 Trip Notes & Instructions</label>
                <textarea
                  id="inp-log-notes"
                  className="modal-inp text-xs"
                  rows={2}
                  placeholder="Gate code, key handover, specific route instructions..."
                  value={tripNotes}
                  onChange={e => setTripNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions grid grid-cols-2 gap-2 pt-2 mt-auto shrink-0">
                <button
                  type="button"
                  className="btn btn-secondary btn-full py-2.5 rounded-xl font-bold text-xs"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-full btn-glow py-2.5 rounded-xl font-black text-xs"
                  disabled={tripSaving}
                >
                  {tripSaving ? 'Logging Trip...' : 'Confirm & Log Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MANAGE FLEET CARS MODAL (POLO, FIESTA, I20 CRUD)
          ========================================================================= */}
      {activeModal === 'cars' && (
        <div className="modal-backdrop fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card w-full max-w-[460px] my-auto p-5 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
              <div>
                <h2 className="modal-heading text-lg font-black text-white">Fleet Vehicles Management</h2>
                <small className="text-gold text-xs font-semibold">VW Polo, Ford Fiesta, Hyundai i20 Rotation</small>
              </div>
              <button
                type="button"
                className="modal-close w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            {/* List of active cars */}
            <div className="flex flex-col gap-2 mb-3 overflow-y-auto max-h-[220px] pr-1">
              {cars.map(c => (
                <div
                  key={c._id || c.id}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex flex-col">
                    <strong className="text-sm font-bold text-white">{c.name}</strong>
                    <span className="text-xs text-amber-400 font-mono font-bold">{c.plate}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {c.color} • {c.fuelPercent || 90}% Fuel • {c.odometerKm || 35000} km
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-xs px-2.5 py-1.5 rounded-lg text-xs hover:scale-105 active:scale-95 transition-all"
                    onClick={() => handleDeleteCar(c._id || c.id)}
                    title="Remove Car"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Add Car Form */}
            <form onSubmit={handleAddCar} className="modal-form flex flex-col gap-3 pt-3 border-t border-white/10 shrink-0">
              <span className="section-micro-lbl text-[11px] font-black text-cyan-400 uppercase tracking-wider">REGISTER NEW FLEET CAR</span>

              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-car-name">Car Nickname *</label>
                <input
                  type="text"
                  id="inp-car-name"
                  className="modal-inp text-xs"
                  placeholder="e.g. VW Polo Hatch"
                  value={newCarName}
                  onChange={e => setNewCarName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-car-model">Model & Engine *</label>
                <input
                  type="text"
                  id="inp-car-model"
                  className="modal-inp text-xs"
                  placeholder="e.g. Polo TSI Comfortline"
                  value={newCarModel}
                  onChange={e => setNewCarModel(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-car-plate">License Plate *</label>
                <input
                  type="text"
                  id="inp-car-plate"
                  className="modal-inp text-xs font-mono"
                  placeholder="e.g. GP 884-POL"
                  value={newCarPlate}
                  onChange={e => setNewCarPlate(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  className="btn btn-secondary btn-full py-2.5 rounded-xl font-bold text-xs"
                  onClick={() => setActiveModal(null)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-cyan btn-full py-2.5 rounded-xl font-black text-xs text-slate-950 hover:scale-[1.01] active:scale-[0.98] transition-all"
                  disabled={carSaving}
                >
                  {carSaving ? 'Registering...' : '+ Add to Fleet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          POPIA COMPLIANCE MODAL
          ========================================================================= */}
      {activeModal === 'popia' && (
        <div className="modal-backdrop fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card w-full max-w-[480px] my-auto p-5 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
              <div>
                <h2 className="modal-heading text-lg font-black text-white">POPIA Compliance Notice</h2>
                <small className="text-emerald-400 text-xs font-semibold">Protection of Personal Information Act (Act 4 of 2013)</small>
              </div>
              <button
                type="button"
                className="modal-close w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="popia-status-badge p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 mb-3 shrink-0">
              <span className="status-icon text-2xl">🛡️</span>
              <div className="text-xs">
                <strong className="text-emerald-300 font-bold block">Active POPIA Safeguards</strong>
                <p className="text-slate-300 leading-tight">Personal & transit data is encrypted and processed strictly in line with statutory mandates.</p>
              </div>
            </div>

            <div className="popia-section flex-1 min-h-0 overflow-y-auto flex flex-col gap-2.5 pr-1">
              <div className="popia-condition-card p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
                <span className="cond-num w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-cyan-500/20 text-cyan-400">1</span>
                <div className="text-xs">
                  <strong className="text-white font-bold block mb-0.5">Condition 1: Accountability</strong>
                  <p className="text-slate-400">Jabbz, Tebza, and Fresh uphold responsible processing standards for client names, routes, and vehicles.</p>
                </div>
              </div>

              <div className="popia-condition-card p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
                <span className="cond-num w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-cyan-500/20 text-cyan-400">2</span>
                <div className="text-xs">
                  <strong className="text-white font-bold block mb-0.5">Condition 2: Processing Limitation</strong>
                  <p className="text-slate-400">Information is collected with consent solely for insurance dispatch, return escort, and billing verification.</p>
                </div>
              </div>

              <div className="popia-condition-card p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
                <span className="cond-num w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-cyan-500/20 text-cyan-400">3</span>
                <div className="text-xs">
                  <strong className="text-white font-bold block mb-0.5">Condition 3: Purpose Specification</strong>
                  <p className="text-slate-400">Booking records are retained only as long as necessary for insurance service audit trails.</p>
                </div>
              </div>

              <div className="popia-condition-card p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
                <span className="cond-num w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-cyan-500/20 text-cyan-400">7</span>
                <div className="text-xs">
                  <strong className="text-white font-bold block mb-0.5">Condition 7: Security Safeguards</strong>
                  <p className="text-slate-400">Encrypted MongoDB connections, authenticated JWT sessions, and zero plain-text passwords.</p>
                </div>
              </div>
            </div>

            <div className="modal-actions pt-3 mt-auto shrink-0 border-t border-white/10">
              <button
                type="button"
                className="btn btn-gold btn-full py-2.5 rounded-xl font-bold text-xs"
                onClick={() => setActiveModal(null)}
              >
                Understood & Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CHANGE PASSWORD MODAL (VOLUNTARY)
          ========================================================================= */}
      {activeModal === 'change_password' && (
        <div className="modal-backdrop fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card w-full max-w-[420px] my-auto p-5 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div>
                <h2 className="modal-heading text-lg font-black text-white">Change Driver Password</h2>
                <small className="text-gold text-xs font-semibold">Update your secure access key</small>
              </div>
              <button
                type="button"
                className="modal-close w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="modal-form flex flex-col gap-3">
              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-cur-pw">Current Password</label>
                <input
                  type="password"
                  id="inp-cur-pw"
                  className="modal-inp text-xs"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>

              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-n-pw">New Password (min 6 chars) *</label>
                <input
                  type="password"
                  id="inp-n-pw"
                  className="modal-inp text-xs"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl text-xs font-bold" htmlFor="inp-c-pw">Confirm New Password *</label>
                <input
                  type="password"
                  id="inp-c-pw"
                  className="modal-inp text-xs"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="modal-actions grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-full py-2.5 rounded-xl font-bold text-xs"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-full btn-glow py-2.5 rounded-xl font-black text-xs"
                  disabled={pwLoading}
                >
                  {pwLoading ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
