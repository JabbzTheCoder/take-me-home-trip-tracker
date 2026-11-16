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
  const [authLoading, setAuthLoading] = useState(false);

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
  // activeModal: null | 'trip_detail' | 'log_trip' | 'print_voucher' | 'profile' | 'cars' | 'change_password' | 'popia'
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
      showToast('Photo loaded! Remember to click Save.');
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

  // 1. Loading Screen
  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Connecting to Take Me Home fleet database...</p>
      </div>
    );
  }

  // 2. Authentication Screen (If Not Signed In)
  if (!user || !token) {
    return (
      <main className="mobile-main-container">
        {/* Toast Container */}
        <div id="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type} animate-slide-down`}>
              <div className="toast-icon">
                {t.type === 'error' ? '⚠️' : '✓'}
              </div>
              <div className="toast-message">{t.text}</div>
            </div>
          ))}
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-badge">SECURE JWT FLEET ACCESS</span>
            <h1 className="auth-title">Take Me Home</h1>
            <p className="auth-subtitle">Jabbz, Tebza & Fresh Trip Tracker Portal</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-field">
              <label className="form-lbl" htmlFor="inp-email">Driver Email</label>
              <input
                type="email"
                id="inp-email"
                className="modal-inp"
                placeholder="e.g. jabbz@tmh-fleet.co.za"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-lbl" htmlFor="inp-password">Password</label>
              <input
                type="password"
                id="inp-password"
                className="modal-inp"
                placeholder="Enter your driver password"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                required
              />
            </div>

            {/* Quick Preset Selector */}
            <div className="auth-preset-chips" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', width: '100%' }}>Quick Driver Select:</span>
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                onClick={() => fillPreset('jabbz@tmh-fleet.co.za', 'Jabbz@TMH2026!')}
              >
                Jabbz
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                onClick={() => fillPreset('tebza@tmh-fleet.co.za', 'Tebza@TMH2026!')}
              >
                Tebza
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                onClick={() => fillPreset('fresh@tmh-fleet.co.za', 'Fresh@TMH2026!')}
              >
                Fresh
              </button>
            </div>

            <button type="submit" className="btn btn-gold btn-full btn-glow" disabled={authLoading}>
              {authLoading ? 'Authenticating...' : 'Sign In to Driver Portal'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Dynamic MongoDB Storage • POPIA Compliant</span>
          </div>
        </div>
      </main>
    );
  }

  // 3. Mandatory First Login Password Change Screen
  if (user.mustChangePassword) {
    return (
      <main className="mobile-main-container">
        {/* Toast Container */}
        <div id="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type} animate-slide-down`}>
              <div className="toast-icon">
                {t.type === 'error' ? '⚠️' : '✓'}
              </div>
              <div className="toast-message">{t.text}</div>
            </div>
          ))}
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              MANDATORY SECURITY REQUIREMENT
            </span>
            <h1 className="auth-title">Personalize Your Password</h1>
            <p className="auth-subtitle">
              Hello <strong>{user.name}</strong>! All drivers are required to change their password on first login so that other drivers cannot access your account.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="auth-form">
            <div className="form-field">
              <label className="form-lbl" htmlFor="inp-new-pw">New Secure Password (min 6 characters) *</label>
              <input
                type="password"
                id="inp-new-pw"
                className="modal-inp"
                placeholder="Enter your new secret password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-lbl" htmlFor="inp-confirm-pw">Confirm New Password *</label>
              <input
                type="password"
                id="inp-confirm-pw"
                className="modal-inp"
                placeholder="Re-type your new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-gold btn-full btn-glow" disabled={pwLoading}>
              {pwLoading ? 'Securing Account...' : 'Save Password & Continue'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 4. Main Authenticated Dashboard Screen
  return (
    <main className="mobile-main-container">
      {/* Toast Notifications (Pops at the top) */}
      <div id="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type} animate-slide-down`}>
            <div className="toast-icon">
              {t.type === 'error' ? '⚠️' : '✓'}
            </div>
            <div className="toast-message">{t.text}</div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          CLEAN, UNCLUTTERED TOP BAR (USER REQUIREMENT)
          ========================================================================= */}
      <header className="mobile-header-clean">
        {/* Left: Driver Identity Trigger */}
        <div
          className="driver-profile-trigger"
          onClick={() => {
            initProfileForm(user);
            setActiveModal('profile');
          }}
          title="Click to view & edit your driver profile"
        >
          <div
            className="user-avatar-circle"
            style={{
              background: user.profilePic ? 'transparent' : (user.avatarColor || '#38bdf8')
            }}
          >
            {user.profilePic ? (
              <img src={user.profilePic} alt={user.name} className="avatar-img-preview" />
            ) : (
              (user.name || 'D').charAt(0).toUpperCase()
            )}
          </div>
          <div className="driver-header-text">
            <span className="driver-header-name">{user.name}</span>
            <span className="admin-mini-badge">Admin</span>
          </div>
        </div>

        {/* Right: Clean Action Controls */}
        <div className="header-actions-group" ref={menuRef}>
          <button
            type="button"
            className="btn-manage-cars"
            onClick={() => setActiveModal('cars')}
            title="Manage Fleet Cars (Polo, Fiesta, i20)"
          >
            <span>🚗 Fleet</span>
          </button>

          <button
            type="button"
            className="btn-menu-icon"
            onClick={() => setSystemMenuOpen(prev => !prev)}
            title="Options & Settings"
          >
            ⚙️
          </button>

          {/* Glassmorphism System Menu Dropdown */}
          {systemMenuOpen && (
            <div className="system-menu-dropdown">
              <div
                className="menu-item"
                onClick={() => {
                  initProfileForm(user);
                  setActiveModal('profile');
                  setSystemMenuOpen(false);
                }}
              >
                <span className="menu-icon">👤</span>
                <div className="menu-text">
                  <strong>Driver Profile</strong>
                  <small>Update email, phone & photo</small>
                </div>
              </div>

              <div
                className="menu-item"
                onClick={() => {
                  setActiveModal('cars');
                  setSystemMenuOpen(false);
                }}
              >
                <span className="menu-icon">🚗</span>
                <div className="menu-text">
                  <strong>Manage Fleet Cars</strong>
                  <small>Polo, Fiesta, i20 rotation</small>
                </div>
              </div>

              <div
                className="menu-item"
                onClick={() => {
                  setActiveModal('popia');
                  setSystemMenuOpen(false);
                }}
              >
                <span className="menu-icon">🛡️</span>
                <div className="menu-text">
                  <strong>POPIA Compliance</strong>
                  <small>SA Privacy Act conditions</small>
                </div>
              </div>

              <div
                className="menu-item"
                onClick={() => {
                  setActiveModal('change_password');
                  setSystemMenuOpen(false);
                }}
              >
                <span className="menu-icon">🔑</span>
                <div className="menu-text">
                  <strong>Change Password</strong>
                  <small>Update your login key</small>
                </div>
              </div>

              <div className="menu-divider"></div>

              <div
                className="menu-item menu-logout"
                onClick={handleLogout}
              >
                <span className="menu-icon">🚪</span>
                <div className="menu-text">
                  <strong style={{ color: '#f43f5e' }}>Sign Out</strong>
                  <small>End driver session</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* QUICK STATS TILES */}
      <section className="mobile-stats-row">
        <div className="stat-tile">
          <span className="stat-count">{totalTrips}</span>
          <span className="stat-name">All Trips</span>
        </div>

        <div className="stat-tile tile-gold">
          <span className="stat-count text-gold">{takeMeHomeCount}</span>
          <span className="stat-name">Take Me Home<br /><small>(2 Drivers)</small></span>
        </div>

        <div className="stat-tile tile-cyan">
          <span className="stat-count text-cyan">{chauffeurCount}</span>
          <span className="stat-name">Chauffeur<br /><small>(1 Driver)</small></span>
        </div>

        <div className="stat-tile tile-emerald">
          <span className="stat-count text-emerald">{formatCurrency(totalEarnings)}</span>
          <span className="stat-name">Total Fares</span>
        </div>
      </section>

      {/* FILTER TABS */}
      <div className="mobile-filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({totalTrips})
        </button>
        <button
          className={`filter-tab ${filter === 'take_me_home' ? 'active' : ''}`}
          onClick={() => setFilter('take_me_home')}
        >
          🚗 Take Me Home ({takeMeHomeCount})
        </button>
        <button
          className={`filter-tab ${filter === 'chauffeur' ? 'active' : ''}`}
          onClick={() => setFilter('chauffeur')}
        >
          🎩 Chauffeur ({chauffeurCount})
        </button>
      </div>

      {/* =========================================================================
          COMPACT, DECLUTTERED TRIP LIST (TAP ANY CARD FOR FULL DETAILS)
          ========================================================================= */}
      <section className="mobile-trip-list">
        {filteredTrips.length === 0 ? (
          <div className="mobile-empty-card">
            <p>No {filter === 'all' ? '' : filter.replace('_', ' ')} trips found in database.</p>
            <button
              className="btn btn-gold btn-sm"
              onClick={() => setActiveModal('log_trip')}
            >
              + Log First Trip
            </button>
          </div>
        ) : (
          filteredTrips.map(trip => {
            const isTakeMeHome = trip.type === 'take_me_home';
            const tripId = trip._id || trip.id;

            return (
              <article
                key={tripId}
                className={`compact-trip-card ${trip.status === 'in_progress' ? 'card-transit' : ''}`}
                onClick={() => {
                  setSelectedTrip(trip);
                  setDetailNotesText(trip.notes || '');
                  setIsEditingDetailNotes(false);
                  setActiveModal('trip_detail');
                }}
              >
                {/* Card Header: Type Badge & Status */}
                <div className="compact-card-header">
                  <div className={`compact-type-badge ${isTakeMeHome ? 'type-tmh' : 'type-chauffeur'}`}>
                    {isTakeMeHome ? '🚗 Take Me Home (2 Drivers)' : '🎩 Chauffeur (1 Driver)'}
                  </div>
                  <div className="compact-card-meta">
                    <span className={`status-badge status-${trip.status}`}>
                      {trip.status === 'in_progress' ? '● On Road' : '✓ Done'}
                    </span>
                    <span className="compact-time-text">{trip.date} • {trip.time}</span>
                  </div>
                </div>

                {/* Client & Fare Row */}
                <div className="compact-client-row">
                  <div className="client-meta-col">
                    <h3 className="compact-client-title">{trip.clientName}</h3>
                    {isTakeMeHome && trip.clientCar && (
                      <span className="compact-subcar">Client's <strong>{trip.clientCar}</strong></span>
                    )}
                  </div>
                  <div className="compact-fare-val">{formatCurrency(trip.fare)}</div>
                </div>

                {/* Route Snippet */}
                <div className="compact-route-snippet">
                  <span className="route-point-txt">📍 {trip.pickup}</span>
                  <span className="route-arrow-txt">➔</span>
                  <span className="route-point-txt">🏁 {trip.dropoff}</span>
                </div>

                {/* Card Bottom: Drivers & View Details Button */}
                <div className="compact-card-bottom">
                  <div className="compact-drivers-summary">
                    <span className="driver-icon-sm">👤</span>
                    <span className="driver-names-sm">
                      {isTakeMeHome
                        ? `${trip.clientDriverName || 'Lead'} & ${trip.chaseDriverName || 'Chase'} (${trip.chaseCar || 'Escort'})`
                        : `${trip.driverName || 'Driver'} (${trip.car || 'Fleet'})`}
                    </span>
                  </div>

                  <div className="compact-action-row">
                    <span className="compact-tap-hint">View Details ›</span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* MOBILE FLOATING ACTION BUTTON (LOG TRIP) */}
      <div className="mobile-fab-container">
        <button
          type="button"
          className="btn-fab-log"
          onClick={() => setActiveModal('log_trip')}
        >
          <span>+ Log Trip</span>
        </button>
      </div>

      {/* =========================================================================
          DEDICATED TRIP DETAIL MODAL (DECLUTTERED DETAIL VIEW)
          ========================================================================= */}
      {activeModal === 'trip_detail' && selectedTrip && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="trip-detail-dialog-card" onClick={e => e.stopPropagation()}>
            <div className="detail-modal-card">
              {/* Top Navigation */}
              <div className="detail-top-nav">
                <button
                  type="button"
                  className="btn-back-link"
                  onClick={() => setActiveModal(null)}
                >
                  <span className="back-arrow">←</span>
                  <span>Back to Trips</span>
                </button>
                <div className="detail-header-right">
                  <span className={`status-pill status-${selectedTrip.status}`}>
                    {selectedTrip.status === 'completed' ? '✓ Completed' : '● In Transit'}
                  </span>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setActiveModal(null)}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Hero Header */}
              <div className={`detail-hero-banner ${selectedTrip.type === 'take_me_home' ? 'hero-tmh' : 'hero-chauffeur'}`}>
                <div className="hero-type-row">
                  <span className="type-tag">
                    {selectedTrip.type === 'take_me_home' ? '🚗 TAKE ME HOME' : '🎩 CHAUFFEUR'}
                  </span>
                  <span className="detail-time-tag">{selectedTrip.date} • {selectedTrip.time}</span>
                </div>
                <h2 className="detail-client-name">{selectedTrip.clientName}</h2>
                {selectedTrip.clientPhone && (
                  <a href={`tel:${selectedTrip.clientPhone}`} className="detail-phone-btn">
                    <span>📞 Call {selectedTrip.clientPhone}</span>
                  </a>
                )}
                {selectedTrip.type === 'take_me_home' && selectedTrip.clientCar && (
                  <div className="detail-client-car-badge">
                    <span>Client Car: <strong>{selectedTrip.clientCar}</strong></span>
                  </div>
                )}
              </div>

              {/* Route Section */}
              <div className="detail-section-box">
                <span className="section-micro-lbl">TRANSIT ROUTE</span>
                <div className="detail-route-flow">
                  <div className="route-step">
                    <span className="route-marker pickup-marker"></span>
                    <div>
                      <span className="route-lbl">PICKUP VENUE</span>
                      <p className="route-addr">{selectedTrip.pickup}</p>
                    </div>
                  </div>
                  <div className="route-step-line"></div>
                  <div className="route-step">
                    <span className="route-marker dropoff-marker"></span>
                    <div>
                      <span className="route-lbl">DESTINATION</span>
                      <p className="route-addr">{selectedTrip.dropoff}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Who Done It Section */}
              <div className="detail-section-box who-box-accent">
                <div className="section-title-row">
                  <span className="section-micro-lbl">WHO DONE THIS TRIP</span>
                  <span className="who-count-badge">
                    {selectedTrip.type === 'take_me_home' ? '2 Drivers' : '1 Driver'}
                  </span>
                </div>

                {selectedTrip.type === 'take_me_home' ? (
                  <div className="detail-dual-drivers">
                    <div className="detail-driver-item">
                      <div className="driver-num-badge">1</div>
                      <div>
                        <span className="driver-role-title">Drove Client's Car</span>
                        <strong className="driver-name-highlight">{selectedTrip.clientDriverName || 'Lead Driver'}</strong>
                      </div>
                    </div>

                    <div className="detail-driver-item">
                      <div className="driver-num-badge badge-chase">2</div>
                      <div>
                        <span className="driver-role-title">Drove Escort Chase Car</span>
                        <strong className="driver-name-highlight">{selectedTrip.chaseDriverName || 'Chase Driver'}</strong>
                        <small className="chase-car-text">{selectedTrip.chaseCar || 'Fleet Escort'}</small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="detail-driver-item">
                    <div className="driver-num-badge">🎩</div>
                    <div>
                      <span className="driver-role-title">Chauffeur Driver</span>
                      <strong className="driver-name-highlight">{selectedTrip.driverName || 'Driver'}</strong>
                      <small className="chase-car-text">Fleet Car: {selectedTrip.car || 'Commercial Fleet'}</small>
                    </div>
                  </div>
                )}
              </div>

              {/* Prominent Trip Notes with Live Edit */}
              <div className="detail-section-box notes-box-gold">
                <div className="section-title-row">
                  <span className="section-micro-lbl">📝 TRIP NOTES & INSTRUCTIONS</span>
                  <button
                    type="button"
                    className="btn-text-edit"
                    onClick={() => setIsEditingDetailNotes(prev => !prev)}
                  >
                    {isEditingDetailNotes ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {!isEditingDetailNotes ? (
                  <p className="detail-notes-text">
                    {selectedTrip.notes && selectedTrip.notes.trim() ? (
                      selectedTrip.notes
                    ) : (
                      <em>No notes recorded for this trip yet.</em>
                    )}
                  </p>
                ) : (
                  <div className="edit-notes-form">
                    <textarea
                      className="modal-inp"
                      rows={3}
                      value={detailNotesText}
                      onChange={e => setDetailNotesText(e.target.value)}
                      placeholder="Enter gate codes, key handover info, etc..."
                    />
                    <div className="edit-notes-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsEditingDetailNotes(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-gold btn-sm"
                        onClick={handleSaveDetailNotes}
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Fare & Financials */}
              <div className="detail-fare-card">
                <span className="fare-card-lbl">Agreed Rate / Fare</span>
                <span className="fare-card-val">{formatCurrency(selectedTrip.fare)}</span>
              </div>

              {/* Actions Stack */}
              <div className="detail-actions-stack">
                <button
                  type="button"
                  className="btn btn-gold btn-full btn-glow"
                  onClick={() => handlePrintPDF(selectedTrip)}
                >
                  <span>Print Official PDF Voucher</span>
                </button>

                <div className="detail-actions-row">
                  <button
                    type="button"
                    className={`btn ${selectedTrip.status === 'completed' ? 'btn-secondary' : 'btn-emerald'} btn-full`}
                    onClick={() => handleToggleTripStatus(selectedTrip)}
                  >
                    <span>{selectedTrip.status === 'completed' ? 'Mark In Progress' : 'Mark Completed'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger-outline"
                    onClick={() => handleDeleteTrip(selectedTrip._id || selectedTrip.id)}
                    title="Delete Trip Record"
                  >
                    🗑️
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRIVER PROFILE MODAL (NAME, EMAIL, NUMBER, PIC, COLOR THEME)
          ========================================================================= */}
      {activeModal === 'profile' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div>
                <h2 className="modal-heading">Driver Profile</h2>
                <small className="text-gold">Admin Chauffeur Credentials</small>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form">
              {/* Profile Avatar Preview & Upload */}
              <div className="profile-pic-section">
                <div
                  className="profile-avatar-preview"
                  style={{
                    background: profilePicBase64 ? 'transparent' : profileColor
                  }}
                >
                  {profilePicBase64 ? (
                    <img src={profilePicBase64} alt="Profile" className="avatar-img-preview" />
                  ) : (
                    <span className="avatar-letter-preview">
                      {(profileName || 'D').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="profile-pic-controls">
                  <label className="btn btn-secondary btn-sm" htmlFor="inp-avatar-upload" style={{ cursor: 'pointer' }}>
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
                      className="btn-clear-photo"
                      onClick={() => setProfilePicBase64('')}
                    >
                      Remove Photo
                    </button>
                  )}
                  <small className="text-muted">Max 2.5MB (JPG, PNG, WebP)</small>
                </div>
              </div>

              {/* Avatar Theme Color Selector */}
              <div className="form-field">
                <label className="form-lbl">Avatar Color Theme</label>
                <div className="color-palette-row">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`color-dot ${profileColor.toLowerCase() === c.toLowerCase() ? 'selected-color' : ''}`}
                      style={{ background: c }}
                      onClick={() => setProfileColor(c)}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Driver Name */}
              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-edit-name">Full Driver Name *</label>
                <input
                  type="text"
                  id="inp-edit-name"
                  className="modal-inp"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="e.g. Jabbz"
                  required
                />
              </div>

              {/* Email */}
              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-edit-email">Email Address *</label>
                <input
                  type="email"
                  id="inp-edit-email"
                  className="modal-inp"
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                  placeholder="e.g. jabbz@tmh-fleet.co.za"
                  required
                />
              </div>

              {/* Phone */}
              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-edit-phone">Mobile Contact Number</label>
                <input
                  type="tel"
                  id="inp-edit-phone"
                  className="modal-inp"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  placeholder="e.g. +27 82 450 1198"
                />
              </div>

              {/* Admin Callout */}
              <div className="admin-profile-callout">
                <span className="callout-shield">🛡️</span>
                <div>
                  <strong>Full Admin Powers Enabled</strong>
                  <p>Role: Admin Chauffeur • Unrestricted access to fleet cars, dispatches, audits, and POPIA controls.</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-full btn-glow"
                  disabled={profileSaving}
                >
                  {profileSaving ? 'Saving Profile...' : 'Save Profile Changes'}
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
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div>
                <h2 className="modal-heading">Log New Service Trip</h2>
                <small className="text-gold">Take Me Home (2 Drivers) or Chauffeur (1 Driver)</small>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="modal-form">
              {/* Trip Type Selector */}
              <div className="form-field">
                <label className="form-lbl">Trip Service Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn ${tripType === 'take_me_home' ? 'btn-gold' : 'btn-secondary'} btn-sm`}
                    onClick={() => {
                      setTripType('take_me_home');
                      setTripFare(450);
                    }}
                  >
                    🚗 Take Me Home (2 Drivers)
                  </button>
                  <button
                    type="button"
                    className={`btn ${tripType === 'chauffeur' ? 'btn-cyan' : 'btn-secondary'} btn-sm`}
                    onClick={() => {
                      setTripType('chauffeur');
                      setTripFare(550);
                    }}
                  >
                    🎩 Chauffeur (1 Driver)
                  </button>
                </div>
              </div>

              {/* Drivers & Vehicle Assignment */}
              {tripType === 'take_me_home' ? (
                <>
                  <div className="form-field">
                    <label className="form-lbl">Driver 1 (Drives Client's Vehicle) *</label>
                    <select
                      className="modal-inp"
                      value={tripClientDriver}
                      onChange={e => setTripClientDriver(e.target.value)}
                    >
                      <option value="Jabbz">Jabbz</option>
                      <option value="Tebza">Tebza</option>
                      <option value="Fresh">Fresh</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-lbl">Driver 2 (Drives Escort Chase Car) *</label>
                    <select
                      className="modal-inp"
                      value={tripChaseDriver}
                      onChange={e => setTripChaseDriver(e.target.value)}
                    >
                      <option value="Tebza">Tebza</option>
                      <option value="Jabbz">Jabbz</option>
                      <option value="Fresh">Fresh</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-lbl">Escort Chase Car *</label>
                    <select
                      className="modal-inp"
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

                  <div className="form-field">
                    <label className="form-lbl" htmlFor="inp-client-car">Client's Vehicle Model</label>
                    <input
                      type="text"
                      id="inp-client-car"
                      className="modal-inp"
                      placeholder="e.g. Audi Q7 or Mercedes C200"
                      value={tripClientCar}
                      onChange={e => setTripClientCar(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-field">
                    <label className="form-lbl">Chauffeur Driver *</label>
                    <select
                      className="modal-inp"
                      value={tripChauffeurDriver}
                      onChange={e => setTripChauffeurDriver(e.target.value)}
                    >
                      <option value="Fresh">Fresh</option>
                      <option value="Jabbz">Jabbz</option>
                      <option value="Tebza">Tebza</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-lbl">Commercial Fleet Vehicle *</label>
                    <select
                      className="modal-inp"
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
                </>
              )}

              {/* Client Info */}
              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-log-client">Client Full Name *</label>
                <input
                  type="text"
                  id="inp-log-client"
                  className="modal-inp"
                  placeholder="e.g. Dr. Michael Ndlovu"
                  value={tripClientName}
                  onChange={e => setTripClientName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-log-phone">Client Contact Number</label>
                <input
                  type="tel"
                  id="inp-log-phone"
                  className="modal-inp"
                  placeholder="e.g. +27 83 291 0041"
                  value={tripClientPhone}
                  onChange={e => setTripClientPhone(e.target.value)}
                />
              </div>

              {/* Route */}
              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-log-pickup">Pickup Address / Venue *</label>
                <input
                  type="text"
                  id="inp-log-pickup"
                  className="modal-inp"
                  placeholder="e.g. The Grillhouse, Rosebank Mall"
                  value={tripPickup}
                  onChange={e => setTripPickup(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-log-dropoff">Destination / Dropoff Address *</label>
                <input
                  type="text"
                  id="inp-log-dropoff"
                  className="modal-inp"
                  placeholder="e.g. 42 Cumberland Ave, Bryanston"
                  value={tripDropoff}
                  onChange={e => setTripDropoff(e.target.value)}
                  required
                />
              </div>

              {/* Fare */}
              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-log-fare">Agreed Fare (ZAR Rands) *</label>
                <input
                  type="number"
                  id="inp-log-fare"
                  className="modal-inp"
                  value={tripFare}
                  onChange={e => setTripFare(e.target.value)}
                  required
                />
              </div>

              {/* Trip Notes */}
              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-log-notes">Trip Notes & Audit Details</label>
                <textarea
                  id="inp-log-notes"
                  className="modal-inp"
                  rows={2}
                  placeholder="Gate code, key handover, specific route instructions..."
                  value={tripNotes}
                  onChange={e => setTripNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-full btn-glow"
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
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div>
                <h2 className="modal-heading">Fleet Vehicles Management</h2>
                <small className="text-gold">VW Polo, Ford Fiesta, Hyundai i20 Rotation</small>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            {/* List of active cars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {cars.map(c => (
                <div
                  key={c._id || c.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontFamily: 'monospace' }}>{c.plate}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>
                      {c.color} • {c.fuelPercent || 90}% Fuel • {c.odometerKm || 35000} km
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-xs"
                    onClick={() => handleDeleteCar(c._id || c.id)}
                    title="Remove Car"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Add Car Form */}
            <form onSubmit={handleAddCar} className="modal-form" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <span className="section-micro-lbl">REGISTER NEW FLEET CAR</span>

              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-car-name">Car Nickname *</label>
                <input
                  type="text"
                  id="inp-car-name"
                  className="modal-inp"
                  placeholder="e.g. VW Polo Hatch"
                  value={newCarName}
                  onChange={e => setNewCarName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-car-model">Model & Engine *</label>
                <input
                  type="text"
                  id="inp-car-model"
                  className="modal-inp"
                  placeholder="e.g. Polo TSI Comfortline"
                  value={newCarModel}
                  onChange={e => setNewCarModel(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-car-plate">License Plate *</label>
                <input
                  type="text"
                  id="inp-car-plate"
                  className="modal-inp"
                  placeholder="e.g. GP 884-POL"
                  value={newCarPlate}
                  onChange={e => setNewCarPlate(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => setActiveModal(null)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-cyan btn-full"
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
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div>
                <h2 className="modal-heading">POPIA Compliance Notice</h2>
                <small className="text-emerald">Protection of Personal Information Act (Act 4 of 2013)</small>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="popia-status-badge" style={{ marginBottom: '1rem' }}>
              <span className="status-icon">🛡️</span>
              <div>
                <strong>Active POPIA Safeguards</strong>
                <p>Personal and transit information is encrypted and processed strictly in line with statutory mandates.</p>
              </div>
            </div>

            <div className="popia-section" style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div className="popia-condition-card">
                <span className="cond-num">1</span>
                <div>
                  <strong>Condition 1: Accountability</strong>
                  <p>All drivers (Jabbz, Tebza, Fresh) uphold responsible processing standards for client names, addresses, and vehicles.</p>
                </div>
              </div>

              <div className="popia-condition-card">
                <span className="cond-num">2</span>
                <div>
                  <strong>Condition 2: Processing Limitation</strong>
                  <p>Client information is processed solely for insurance dispatch, vehicle escort transit, and billing verification.</p>
                </div>
              </div>

              <div className="popia-condition-card">
                <span className="cond-num">3</span>
                <div>
                  <strong>Condition 3: Purpose Specification</strong>
                  <p>Data collected during booking is retained only as long as necessary for insurance service audit trails.</p>
                </div>
              </div>

              <div className="popia-condition-card">
                <span className="cond-num">7</span>
                <div>
                  <strong>Condition 7: Security Safeguards</strong>
                  <p>Encrypted MongoDB connections, authenticated JWT sessions, and zero plain-text passwords.</p>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-gold btn-full"
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
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div>
                <h2 className="modal-heading">Change Driver Password</h2>
                <small className="text-gold">Update your secure access key</small>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="modal-form">
              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-cur-pw">Current Password</label>
                <input
                  type="password"
                  id="inp-cur-pw"
                  className="modal-inp"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>

              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-n-pw">New Password (min 6 chars) *</label>
                <input
                  type="password"
                  id="inp-n-pw"
                  className="modal-inp"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-lbl" htmlFor="inp-c-pw">Confirm New Password *</label>
                <input
                  type="password"
                  id="inp-c-pw"
                  className="modal-inp"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-full btn-glow"
                  disabled={pwLoading}
                >
                  {pwLoading ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
