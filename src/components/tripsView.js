// Trips Management View - Comprehensive Ledger, Search, Filters, and Dispatch
import { store } from '../data/store.js';
import { formatCurrency, formatNumber, formatDate, icons } from '../utils/helpers.js';

let tripSearchQuery = '';
let selectedDriverFilter = 'all';
let selectedCarFilter = 'all';
let selectedPartnerFilter = 'all';
let selectedStatusFilter = 'all';

export function renderTrips() {
  const data = store.data;

  // Filter trips based on state
  const filteredTrips = data.trips.filter(t => {
    const query = tripSearchQuery.toLowerCase();
    const matchesSearch = !query ||
      t.id.toLowerCase().includes(query) ||
      t.bookingRef.toLowerCase().includes(query) ||
      t.customerName.toLowerCase().includes(query) ||
      t.pickupAddress.toLowerCase().includes(query) ||
      t.dropoffAddress.toLowerCase().includes(query) ||
      (t.customerCarModel && t.customerCarModel.toLowerCase().includes(query));

    const matchesDriver = selectedDriverFilter === 'all' || t.driverId === selectedDriverFilter;
    const matchesCar = selectedCarFilter === 'all' || t.carId === selectedCarFilter;
    const matchesPartner = selectedPartnerFilter === 'all' || t.partnerId === selectedPartnerFilter;
    const matchesStatus = selectedStatusFilter === 'all' || t.status === selectedStatusFilter;

    return matchesSearch && matchesDriver && matchesCar && matchesPartner && matchesStatus;
  });

  const totalFilteredRevenue = filteredTrips.reduce((acc, t) => acc + (t.fare || 0), 0);
  const totalFilteredDriverPayout = filteredTrips.reduce((acc, t) => acc + (t.split?.driverPayout || 0), 0);
  const totalFilteredPotShare = filteredTrips.reduce((acc, t) => acc + (t.split?.brotherPot || 0), 0);

  return `
    <div class="trips-container animate-fade-in">
      
      <!-- HEADER WITH ACTIONS -->
      <div class="page-top-header">
        <div>
          <h1 class="page-title">Trips Ledger & Dispatch</h1>
          <p class="page-subtitle">Track insurance take-me-home bookings, customer vehicles driven, and rate splits</p>
        </div>

        <div class="header-action-group">
          <button class="btn btn-secondary" id="btn-export-trips-csv">
            ${icons.download}
            <span>Export CSV</span>
          </button>
          <button class="btn btn-gold btn-glow" id="btn-open-new-trip-modal">
            ${icons.plus}
            <span>Dispatch New Trip</span>
          </button>
        </div>
      </div>

      <!-- FILTER BAR -->
      <div class="filter-card">
        <div class="filter-search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            id="trip-search-input" 
            class="filter-input" 
            placeholder="Search by client, booking ref, location, car model..."
            value="${tripSearchQuery}"
          />
          ${tripSearchQuery ? '<button id="btn-clear-search" class="btn-clear">✕</button>' : ''}
        </div>

        <div class="filter-selectors">
          <!-- Driver Filter -->
          <div class="filter-select-wrap">
            <label class="filter-label">Brother / Driver</label>
            <select id="filter-driver-select" class="filter-select">
              <option value="all" ${selectedDriverFilter === 'all' ? 'selected' : ''}>All Brothers (3)</option>
              ${data.drivers.map(d => `
                <option value="${d.id}" ${selectedDriverFilter === d.id ? 'selected' : ''}>${d.name}</option>
              `).join('')}
            </select>
          </div>

          <!-- Car Filter -->
          <div class="filter-select-wrap">
            <label class="filter-label">Vehicle</label>
            <select id="filter-car-select" class="filter-select">
              <option value="all" ${selectedCarFilter === 'all' ? 'selected' : ''}>All Cars (2)</option>
              ${data.cars.map(c => `
                <option value="${c.id}" ${selectedCarFilter === c.id ? 'selected' : ''}>${c.name.split('-')[0]} (${c.plate})</option>
              `).join('')}
            </select>
          </div>

          <!-- Insurance Partner Filter -->
          <div class="filter-select-wrap">
            <label class="filter-label">Insurance Partner</label>
            <select id="filter-partner-select" class="filter-select">
              <option value="all" ${selectedPartnerFilter === 'all' ? 'selected' : ''}>All Partners</option>
              ${data.insurancePartners.map(p => `
                <option value="${p.id}" ${selectedPartnerFilter === p.id ? 'selected' : ''}>${p.name}</option>
              `).join('')}
            </select>
          </div>

          <!-- Status Filter -->
          <div class="filter-select-wrap">
            <label class="filter-label">Status</label>
            <select id="filter-status-select" class="filter-select">
              <option value="all" ${selectedStatusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="in_progress" ${selectedStatusFilter === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="scheduled" ${selectedStatusFilter === 'scheduled' ? 'selected' : ''}>Scheduled</option>
              <option value="completed" ${selectedStatusFilter === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
        </div>

        <!-- Filter summary bar -->
        <div class="filter-summary-row">
          <div class="filtered-counts">
            Showing <strong>${filteredTrips.length}</strong> of ${data.trips.length} trips
          </div>
          <div class="filtered-totals">
            <span>Gross: <strong>${formatCurrency(totalFilteredRevenue)}</strong></span>
            <span>Driver Share: <strong class="text-emerald">${formatCurrency(totalFilteredDriverPayout)}</strong></span>
            <span>Pot Share: <strong class="text-gold">${formatCurrency(totalFilteredPotShare)}</strong></span>
          </div>
        </div>
      </div>

      <!-- TRIPS LIST / CARDS -->
      ${filteredTrips.length === 0 ? `
        <div class="empty-state-card">
          <div class="empty-icon">${icons.car}</div>
          <h3>No trips match your filters</h3>
          <p>Try resetting filters or log a new take me home trip.</p>
          <button class="btn btn-secondary btn-sm" id="btn-reset-filters">Reset All Filters</button>
        </div>
      ` : `
        <div class="trips-cards-grid">
          ${filteredTrips.map(trip => {
            const partner = data.insurancePartners.find(p => p.id === trip.partnerId);
            const driver = data.drivers.find(d => d.id === trip.driverId);
            const car = data.cars.find(c => c.id === trip.carId);

            return `
              <div class="trip-record-card ${trip.status === 'in_progress' ? 'card-border-active' : ''}">
                <div class="trip-card-top">
                  <div class="partner-meta">
                    <span class="partner-tag" style="background: ${partner?.color || '#38BDF8'}20; color: ${partner?.color || '#38BDF8'}; border: 1px solid ${partner?.color || '#38BDF8'}60;">
                      ${partner?.name || 'Partner'}
                    </span>
                    <span class="ref-tag">Ref: ${trip.bookingRef}</span>
                    ${trip.isNight ? `<span class="night-tag">${icons.moon} Night</span>` : ''}
                  </div>

                  <div class="trip-status-badge status-${trip.status}">
                    ${trip.status === 'in_progress' ? '● In Transit' : trip.status === 'scheduled' ? '⏳ Scheduled' : '✓ Completed'}
                  </div>
                </div>

                <div class="trip-client-section">
                  <div class="client-details">
                    <h3 class="client-name">${trip.customerName}</h3>
                    <div class="client-phone">📞 ${trip.customerPhone || 'Direct Dispatch'}</div>
                  </div>
                  <div class="client-car-badge">
                    <span>🚘 ${trip.customerCarModel}</span>
                  </div>
                </div>

                <!-- ROUTE -->
                <div class="trip-route-box">
                  <div class="route-line-decor">
                    <span class="decor-dot start"></span>
                    <span class="decor-dashed"></span>
                    <span class="decor-dot end"></span>
                  </div>
                  <div class="route-text-content">
                    <div class="pickup-text">
                      <span class="label-sub">PICKUP</span>
                      <span class="address-text">${trip.pickupAddress}</span>
                    </div>
                    <div class="dropoff-text">
                      <span class="label-sub">DROPOFF</span>
                      <span class="address-text">${trip.dropoffAddress}</span>
                    </div>
                  </div>
                </div>

                <!-- METRICS & DRIVER -->
                <div class="trip-card-meta-grid">
                  <div class="meta-item">
                    <span class="meta-label">Distance</span>
                    <span class="meta-val"><strong>${trip.distanceKm} km</strong></span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Date & Time</span>
                    <span class="meta-val">${formatDate(trip.date)} • ${trip.time}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Assigned Brother</span>
                    <span class="meta-val flex-val">
                      <span class="avatar-mini" style="background: ${driver?.avatarColor || '#38BDF8'}">
                        ${driver ? driver.name.charAt(0) : 'D'}
                      </span>
                      <span>${driver ? driver.name : 'Unassigned'}</span>
                    </span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Escort Car</span>
                    <span class="meta-val">${car?.plate || 'Car'}</span>
                  </div>
                </div>

                <!-- RATES & SPLIT BREAKDOWN -->
                <div class="trip-split-ribbon">
                  <div class="fare-total-col">
                    <span class="ribbon-label">Total Fare</span>
                    <span class="ribbon-total">${formatCurrency(trip.fare)}</span>
                  </div>
                  <div class="split-breakdown-col">
                    <div class="split-row">
                      <span>Driver Payout (50%):</span>
                      <strong class="text-emerald">${formatCurrency(trip.split?.driverPayout)}</strong>
                    </div>
                    <div class="split-row">
                      <span>Brother Pot (10% each):</span>
                      <strong class="text-gold">${formatCurrency(trip.split?.perBrotherPotShare)}</strong>
                    </div>
                    <div class="split-row text-muted">
                      <span>Car Fuel Fund (20%):</span>
                      <span>${formatCurrency(trip.split?.fuelFund)}</span>
                    </div>
                  </div>
                </div>

                ${trip.rating ? `
                  <div class="trip-rating-row">
                    <span class="stars">${'★'.repeat(Math.round(trip.rating))}</span>
                    <span class="feedback-quote">"${trip.feedback || 'Great service!'}"</span>
                  </div>
                ` : ''}

                <!-- ACTIONS -->
                <div class="trip-card-actions">
                  ${trip.status === 'in_progress' ? `
                    <button class="btn btn-emerald btn-sm btn-complete-trip" data-trip-id="${trip.id}">
                      ${icons.check}
                      <span>Complete Trip</span>
                    </button>
                  ` : ''}
                  
                  <button class="btn btn-secondary btn-sm btn-view-receipt" data-trip-id="${trip.id}">
                    ${icons.receipt}
                    <span>Voucher / Receipt</span>
                  </button>

                  <button class="btn-delete-trip" data-trip-id="${trip.id}" title="Remove trip">
                    🗑️
                  </button>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      `}

    </div>
  `;
}

// Bind view events
export function bindTripsEvents(container) {
  const searchInput = container.querySelector('#trip-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      tripSearchQuery = e.target.value;
      container.innerHTML = renderTrips();
      bindTripsEvents(container);
    });
  }

  const clearBtn = container.querySelector('#btn-clear-search');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      tripSearchQuery = '';
      container.innerHTML = renderTrips();
      bindTripsEvents(container);
    });
  }

  const driverSelect = container.querySelector('#filter-driver-select');
  if (driverSelect) {
    driverSelect.addEventListener('change', (e) => {
      selectedDriverFilter = e.target.value;
      container.innerHTML = renderTrips();
      bindTripsEvents(container);
    });
  }

  const carSelect = container.querySelector('#filter-car-select');
  if (carSelect) {
    carSelect.addEventListener('change', (e) => {
      selectedCarFilter = e.target.value;
      container.innerHTML = renderTrips();
      bindTripsEvents(container);
    });
  }

  const partnerSelect = container.querySelector('#filter-partner-select');
  if (partnerSelect) {
    partnerSelect.addEventListener('change', (e) => {
      selectedPartnerFilter = e.target.value;
      container.innerHTML = renderTrips();
      bindTripsEvents(container);
    });
  }

  const statusSelect = container.querySelector('#filter-status-select');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      selectedStatusFilter = e.target.value;
      container.innerHTML = renderTrips();
      bindTripsEvents(container);
    });
  }

  const resetBtn = container.querySelector('#btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      tripSearchQuery = '';
      selectedDriverFilter = 'all';
      selectedCarFilter = 'all';
      selectedPartnerFilter = 'all';
      selectedStatusFilter = 'all';
      container.innerHTML = renderTrips();
      bindTripsEvents(container);
    });
  }
}
