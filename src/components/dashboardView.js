// Dashboard View - Clean Mobile-First Header, Compact Trips Feed, and Trip Detail Integration
import { api } from '../data/api.js';
import { formatCurrency, showToast, icons } from '../utils/helpers.js';
import { openTripDetail } from './tripDetailView.js';

let activeFilter = 'all'; // 'all' | 'take_me_home' | 'chauffeur'
let cachedTrips = [];

export function renderDashboard(trips = []) {
  cachedTrips = trips;
  const user = api.getCurrentUser();

  const totalTrips = trips.length;
  const takeMeHomeCount = trips.filter(t => t.type === 'take_me_home').length;
  const chauffeurCount = trips.filter(t => t.type === 'chauffeur').length;
  const totalEarnings = trips.reduce((acc, t) => acc + (t.fare || 0), 0);

  // Filter trips
  const filteredTrips = trips.filter(t => {
    if (activeFilter === 'all') return true;
    return t.type === activeFilter;
  });

  return `
    <div class="mobile-dashboard animate-fade-in">
      
      <!-- CLEAN TOP BAR (UNCLUTTERED, PROFESSIONAL & MODERN) -->
      <header class="mobile-top-bar">
        <!-- User Profile (Tap to Edit) -->
        <div class="user-profile-badge" id="btn-header-profile" title="Tap to update profile, email, phone & picture">
          ${user?.profilePic ? `
            <img src="${user.profilePic}" alt="${user.name}" class="user-avatar-img" />
          ` : `
            <span class="user-avatar" style="background: ${user?.avatarColor || '#38bdf8'}">
              ${user ? user.name.charAt(0).toUpperCase() : 'J'}
            </span>
          `}
          <div class="user-names">
            <div class="user-name-title-row">
              <span class="greeting-name">${user ? user.name : 'Driver'}</span>
              <span class="admin-badge-mini">Admin</span>
            </div>
            <span class="greeting-sub">● Online • Tap for Profile</span>
          </div>
        </div>

        <!-- Clean Action Buttons: Fleet & System Menu -->
        <div class="top-bar-actions">
          <button type="button" class="btn-manage-cars" id="btn-manage-fleet-cars" title="Manage Fleet (Polo, Fiesta, i20)">
            <span>🚗 Fleet</span>
          </button>
          <button type="button" class="btn-menu-icon" id="btn-toggle-menu" title="Menu & Settings">
            <span>⚙️</span>
          </button>
        </div>
      </header>

      <!-- DROPDOWN QUICK MENU (REDUCES HEADER CLUTTER) -->
      <div id="quick-system-menu" class="system-menu-dropdown hidden">
        <div class="menu-item" id="menu-opt-profile">
          <span class="menu-icon">👤</span>
          <div class="menu-text">
            <strong>My Driver Profile</strong>
            <small>Update name, email, phone & picture</small>
          </div>
        </div>

        <div class="menu-item" id="menu-opt-fleet">
          <span class="menu-icon">🚗</span>
          <div class="menu-text">
            <strong>Fleet Management</strong>
            <small>Manage Polo, Fiesta, i20 & new cars</small>
          </div>
        </div>

        <div class="menu-item" id="menu-opt-popia">
          <span class="menu-icon">🛡️</span>
          <div class="menu-text">
            <strong>POPIA Compliance Statement</strong>
            <small>Act 4 of 2013 data protection audit</small>
          </div>
        </div>

        <div class="menu-item" id="menu-opt-pass">
          <span class="menu-icon">🔑</span>
          <div class="menu-text">
            <strong>Change Password</strong>
            <small>Update private secret password</small>
          </div>
        </div>

        <div class="menu-divider"></div>

        <div class="menu-item menu-logout" id="menu-opt-logout">
          <span class="menu-icon">🚪</span>
          <div class="menu-text">
            <strong class="text-rose">Sign Out</strong>
          </div>
        </div>
      </div>

      <!-- QUICK STATS TILES -->
      <section class="mobile-stats-row">
        <div class="stat-tile">
          <span class="stat-count">${totalTrips}</span>
          <span class="stat-name">All Trips</span>
        </div>

        <div class="stat-tile tile-gold">
          <span class="stat-count text-gold">${takeMeHomeCount}</span>
          <span class="stat-name">Take Me Home<br><small>(2 Drivers)</small></span>
        </div>

        <div class="stat-tile tile-cyan">
          <span class="stat-count text-cyan">${chauffeurCount}</span>
          <span class="stat-name">Chauffeur<br><small>(1 Driver)</small></span>
        </div>

        <div class="stat-tile tile-emerald">
          <span class="stat-count text-emerald">${formatCurrency(totalEarnings)}</span>
          <span class="stat-name">Total Fares</span>
        </div>
      </section>

      <!-- FILTER TABS -->
      <div class="mobile-filter-tabs">
        <button class="filter-tab ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
          All (${totalTrips})
        </button>
        <button class="filter-tab ${activeFilter === 'take_me_home' ? 'active' : ''}" data-filter="take_me_home">
          🚗 Take Me Home (${takeMeHomeCount})
        </button>
        <button class="filter-tab ${activeFilter === 'chauffeur' ? 'active' : ''}" data-filter="chauffeur">
          🎩 Chauffeur (${chauffeurCount})
        </button>
      </div>

      <!-- COMPACT, CLEAN TRIP LIST (TAP ANY CARD FOR FULL DETAILS) -->
      <section class="mobile-trip-list">
        ${filteredTrips.length === 0 ? `
          <div class="mobile-empty-card">
            <div class="empty-icon">${icons.car}</div>
            <p>No ${activeFilter === 'all' ? '' : activeFilter.replace('_', ' ')} trips found in database.</p>
            <button class="btn btn-gold btn-sm" id="btn-empty-log-trip">+ Log First Trip</button>
          </div>
        ` : filteredTrips.map(trip => {
          const isTakeMeHome = trip.type === 'take_me_home';
          const tripId = trip._id || trip.id;

          return `
            <article class="compact-trip-card ${trip.status === 'in_progress' ? 'card-transit' : ''}" data-trip-id="${tripId}">
              
              <!-- Card Header: Type Badge & Status -->
              <div class="compact-card-header">
                <div class="compact-type-badge ${isTakeMeHome ? 'type-tmh' : 'type-chauffeur'}">
                  ${isTakeMeHome ? '🚗 Take Me Home (2 Drivers)' : '🎩 Chauffeur (1 Driver)'}
                </div>
                <div class="compact-card-meta">
                  <span class="status-badge status-${trip.status}">
                    ${trip.status === 'in_progress' ? '● On Road' : '✓ Done'}
                  </span>
                  <span class="compact-time-text">${trip.date} • ${trip.time}</span>
                </div>
              </div>

              <!-- Client & Fare Row -->
              <div class="compact-client-row">
                <div class="client-meta-col">
                  <h3 class="compact-client-title">${trip.clientName}</h3>
                  ${isTakeMeHome && trip.clientCar ? `
                    <span class="compact-subcar">Client's <strong>${trip.clientCar}</strong></span>
                  ` : ''}
                </div>
                <div class="compact-fare-val">${formatCurrency(trip.fare)}</div>
              </div>

              <!-- Route Snippet -->
              <div class="compact-route-snippet">
                <span class="route-point-txt">📍 ${trip.pickup}</span>
                <span class="route-arrow-txt">➔</span>
                <span class="route-point-txt">🏁 ${trip.dropoff}</span>
              </div>

              <!-- Card Bottom: Drivers & View Details Button -->
              <div class="compact-card-bottom">
                <div class="compact-drivers-summary">
                  <span class="driver-icon-sm">👤</span>
                  <span class="driver-names-sm">
                    ${isTakeMeHome 
                      ? `${trip.clientDriverName || 'Lead'} & ${trip.chaseDriverName || 'Chase'} (${trip.chaseCar || 'Escort'})` 
                      : `${trip.driverName || 'Driver'} (${trip.car || 'Fleet'})`}
                  </span>
                </div>

                <div class="compact-action-row">
                  <span class="compact-tap-hint">View Details ›</span>
                </div>
              </div>

            </article>
          `;
        }).join('')}
      </section>

      <!-- MOBILE FLOATING ACTION BUTTON (LOG TRIP) -->
      <div class="mobile-fab-container">
        <button type="button" class="btn-fab-log" id="btn-fab-log-trip">
          ${icons.plus}
          <span>Log Trip</span>
        </button>
      </div>

    </div>
  `;
}

export function bindDashboardEvents(container, onRefresh, onLogout, onOpenCarsModal, onOpenChangePassword, onOpenPopia, onOpenProfile) {
  // Filter tabs
  container.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      activeFilter = e.currentTarget.dataset.filter;
      container.innerHTML = renderDashboard(cachedTrips);
      bindDashboardEvents(container, onRefresh, onLogout, onOpenCarsModal, onOpenChangePassword, onOpenPopia, onOpenProfile);
    });
  });

  // Tap Profile in header
  container.querySelector('#btn-header-profile')?.addEventListener('click', () => {
    if (onOpenProfile) onOpenProfile();
  });

  // Toggle Dropdown Menu
  const menuBtn = container.querySelector('#btn-toggle-menu');
  const menuDropdown = container.querySelector('#quick-system-menu');
  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    menuDropdown?.classList.toggle('hidden');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuDropdown?.contains(e.target) && e.target !== menuBtn) {
      menuDropdown?.classList.add('hidden');
    }
  });

  // Menu item clicks
  container.querySelector('#menu-opt-profile')?.addEventListener('click', () => {
    menuDropdown?.classList.add('hidden');
    if (onOpenProfile) onOpenProfile();
  });

  container.querySelector('#menu-opt-fleet')?.addEventListener('click', () => {
    menuDropdown?.classList.add('hidden');
    if (onOpenCarsModal) onOpenCarsModal();
  });

  container.querySelector('#menu-opt-popia')?.addEventListener('click', () => {
    menuDropdown?.classList.add('hidden');
    if (onOpenPopia) onOpenPopia();
  });

  container.querySelector('#menu-opt-pass')?.addEventListener('click', () => {
    menuDropdown?.classList.add('hidden');
    if (onOpenChangePassword) onOpenChangePassword();
  });

  container.querySelector('#menu-opt-logout')?.addEventListener('click', () => {
    menuDropdown?.classList.add('hidden');
    api.logout();
    showToast('Signed out successfully');
    if (onLogout) onLogout();
  });

  // Fleet cars modal button in top bar
  container.querySelector('#btn-manage-fleet-cars')?.addEventListener('click', () => {
    if (onOpenCarsModal) onOpenCarsModal();
  });

  // FAB Log trip
  container.querySelector('#btn-fab-log-trip')?.addEventListener('click', () => {
    document.getElementById('simple-trip-dialog')?.showModal();
  });

  container.querySelector('#btn-empty-log-trip')?.addEventListener('click', () => {
    document.getElementById('simple-trip-dialog')?.showModal();
  });

  // CLICK ANY COMPACT TRIP CARD -> OPEN DEDICATED TRIP DETAIL VIEW
  container.querySelectorAll('.compact-trip-card').forEach(card => {
    card.addEventListener('click', () => {
      const tripId = card.dataset.tripId;
      const trip = cachedTrips.find(t => (t._id || t.id) === tripId);
      if (trip) {
        openTripDetail(trip, () => {
          if (onRefresh) onRefresh();
        });
      }
    });
  });
}
