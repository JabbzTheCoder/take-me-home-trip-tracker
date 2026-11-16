// Cars Fleet View - Managing the Two Vehicles, Rotation, Mileage, and Handover Logs
import { store } from '../data/store.js';
import { formatNumber, formatDate, icons } from '../utils/helpers.js';

export function renderCars() {
  const data = store.data;
  const car1 = data.cars.find(c => c.id === 'car-1') || data.cars[0];
  const car2 = data.cars.find(c => c.id === 'car-2') || data.cars[1];

  const driver1 = data.drivers.find(d => d.id === car1?.currentDriverId);
  const driver2 = data.drivers.find(d => d.id === car2?.currentDriverId);

  // Calculate stats for each car
  const car1Trips = data.trips.filter(t => t.carId === car1.id);
  const car2Trips = data.trips.filter(t => t.carId === car2.id);

  const car1KmDriven = car1Trips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
  const car2KmDriven = car2Trips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);

  const car1ServiceRemaining = Math.max(0, car1.nextServiceKm - car1.odometerKm);
  const car2ServiceRemaining = Math.max(0, car2.nextServiceKm - car2.odometerKm);

  return `
    <div class="cars-container animate-fade-in">
      
      <!-- HEADER -->
      <div class="page-top-header">
        <div>
          <h1 class="page-title">Fleet Vehicles Management</h1>
          <p class="page-subtitle">Manage the 2 rotation cars, inspect vehicle health, track mileage, and log brother handovers</p>
        </div>

        <button class="btn btn-gold btn-glow" id="btn-open-handover-modal">
          ${icons.swap}
          <span>Log Vehicle Handover</span>
        </button>
      </div>

      <!-- CARS SHOWCASE GRID (THE TWO VEHICLES) -->
      <div class="cars-spotlight-grid">
        
        <!-- CAR 1 -->
        <div class="car-spotlight-card">
          <div class="car-image-container">
            <img src="${car1.image}" alt="${car1.name}" class="car-full-img" />
            <div class="car-floating-badge badge-car-1">CAR 1</div>
            <div class="car-status-pill status-${car1.status}">
              <span class="live-dot pulse"></span>
              <span>In Active Service</span>
            </div>
          </div>

          <div class="car-card-body">
            <div class="car-header-row">
              <div>
                <h2 class="car-model-name">${car1.name}</h2>
                <div class="car-nickname">"${car1.nickname}" • ${car1.color}</div>
              </div>
              <div class="car-plate-badge">${car1.plate}</div>
            </div>

            <!-- CURRENT KEYHOLDER -->
            <div class="keyholder-banner">
              <div class="keyholder-avatar" style="background: ${driver1?.avatarColor || '#38BDF8'}">
                ${driver1 ? driver1.name.charAt(0) : 'K'}
              </div>
              <div class="keyholder-info">
                <span class="keyholder-label">🔑 Current Key Holder</span>
                <span class="keyholder-name"><strong>${driver1 ? driver1.name : 'Unassigned'}</strong></span>
                <span class="keyholder-role">${driver1 ? driver1.role : 'Standby'}</span>
              </div>
              <button class="btn btn-outline btn-xs btn-quick-swap" data-car-id="${car1.id}">
                Swap Keys
              </button>
            </div>

            <!-- GAUGES & METRICS -->
            <div class="car-metrics-grid">
              <!-- Fuel -->
              <div class="metric-box">
                <div class="metric-box-header">
                  <span>${icons.gas} Fuel Tank</span>
                  <strong>${car1.fuelPercent}%</strong>
                </div>
                <div class="meter-track">
                  <div class="meter-fill ${car1.fuelPercent < 25 ? 'low' : ''}" style="width: ${car1.fuelPercent}%"></div>
                </div>
                <div class="metric-footnote">${car1.fuelType}</div>
              </div>

              <!-- Odometer -->
              <div class="metric-box">
                <div class="metric-box-header">
                  <span>Odometer</span>
                  <strong>${formatNumber(car1.odometerKm)} km</strong>
                </div>
                <div class="metric-footnote">Last service at ${formatNumber(car1.lastServiceKm)} km</div>
              </div>

              <!-- Service countdown -->
              <div class="metric-box">
                <div class="metric-box-header">
                  <span>Next Service</span>
                  <strong class="text-gold">In ${formatNumber(car1ServiceRemaining)} km</strong>
                </div>
                <div class="meter-track">
                  <div class="meter-fill" style="width: ${Math.min(100, Math.round(((car1.odometerKm - car1.lastServiceKm) / (car1.nextServiceKm - car1.lastServiceKm)) * 100))}%; background: #F59E0B;"></div>
                </div>
                <div class="metric-footnote">Target: ${formatNumber(car1.nextServiceKm)} km</div>
              </div>

              <!-- Trips logged -->
              <div class="metric-box">
                <div class="metric-box-header">
                  <span>Trips Run</span>
                  <strong>${car1Trips.length} trips</strong>
                </div>
                <div class="metric-footnote">${Math.round(car1KmDriven)} km on duty</div>
              </div>
            </div>

            <!-- REGISTRATION & INSURANCE INFO -->
            <div class="car-compliance-bar">
              <div>
                <span class="comp-label">Commercial Insurance:</span>
                <span class="comp-val">${car1.insurancePolicy}</span>
              </div>
              <div>
                <span class="comp-label">Disk Expiry:</span>
                <span class="comp-val">${formatDate(car1.licenseDiskExpiry)}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- CAR 2 -->
        <div class="car-spotlight-card">
          <div class="car-image-container">
            <img src="${car2.image}" alt="${car2.name}" class="car-full-img" />
            <div class="car-floating-badge badge-car-2">CAR 2</div>
            <div class="car-status-pill status-${car2.status}">
              <span class="live-dot pulse"></span>
              <span>In Active Service</span>
            </div>
          </div>

          <div class="car-card-body">
            <div class="car-header-row">
              <div>
                <h2 class="car-model-name">${car2.name}</h2>
                <div class="car-nickname">"${car2.nickname}" • ${car2.color}</div>
              </div>
              <div class="car-plate-badge badge-blue">${car2.plate}</div>
            </div>

            <!-- CURRENT KEYHOLDER -->
            <div class="keyholder-banner banner-blue">
              <div class="keyholder-avatar" style="background: ${driver2?.avatarColor || '#F59E0B'}">
                ${driver2 ? driver2.name.charAt(0) : 'T'}
              </div>
              <div class="keyholder-info">
                <span class="keyholder-label">🔑 Current Key Holder</span>
                <span class="keyholder-name"><strong>${driver2 ? driver2.name : 'Unassigned'}</strong></span>
                <span class="keyholder-role">${driver2 ? driver2.role : 'Standby'}</span>
              </div>
              <button class="btn btn-outline btn-xs btn-quick-swap" data-car-id="${car2.id}">
                Swap Keys
              </button>
            </div>

            <!-- GAUGES & METRICS -->
            <div class="car-metrics-grid">
              <!-- Fuel -->
              <div class="metric-box">
                <div class="metric-box-header">
                  <span>${icons.gas} Fuel Tank</span>
                  <strong>${car2.fuelPercent}%</strong>
                </div>
                <div class="meter-track">
                  <div class="meter-fill ${car2.fuelPercent < 25 ? 'low' : ''}" style="width: ${car2.fuelPercent}%"></div>
                </div>
                <div class="metric-footnote">${car2.fuelType}</div>
              </div>

              <!-- Odometer -->
              <div class="metric-box">
                <div class="metric-box-header">
                  <span>Odometer</span>
                  <strong>${formatNumber(car2.odometerKm)} km</strong>
                </div>
                <div class="metric-footnote">Last service at ${formatNumber(car2.lastServiceKm)} km</div>
              </div>

              <!-- Service countdown -->
              <div class="metric-box">
                <div class="metric-box-header">
                  <span>Next Service</span>
                  <strong class="text-gold">In ${formatNumber(car2ServiceRemaining)} km</strong>
                </div>
                <div class="meter-track">
                  <div class="meter-fill" style="width: ${Math.min(100, Math.round(((car2.odometerKm - car2.lastServiceKm) / (car2.nextServiceKm - car2.lastServiceKm)) * 100))}%; background: #F59E0B;"></div>
                </div>
                <div class="metric-footnote">Target: ${formatNumber(car2.nextServiceKm)} km</div>
              </div>

              <!-- Trips logged -->
              <div class="metric-box">
                <div class="metric-box-header">
                  <span>Trips Run</span>
                  <strong>${car2Trips.length} trips</strong>
                </div>
                <div class="metric-footnote">${Math.round(car2KmDriven)} km on duty</div>
              </div>
            </div>

            <!-- REGISTRATION & INSURANCE INFO -->
            <div class="car-compliance-bar">
              <div>
                <span class="comp-label">Commercial Insurance:</span>
                <span class="comp-val">${car2.insurancePolicy}</span>
              </div>
              <div>
                <span class="comp-label">Disk Expiry:</span>
                <span class="comp-val">${formatDate(car2.licenseDiskExpiry)}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- HANDOVER LOG HISTORY -->
      <section class="dash-card mt-6">
        <div class="dash-card-header">
          <div>
            <h2 class="dash-card-title">Vehicle Rotation & Handover History</h2>
            <p class="dash-card-subtitle">Official chain-of-custody between the 3 brothers with odometer and fuel verification</p>
          </div>
          <span class="badge-tag">${data.handovers.length} Total Handovers</span>
        </div>

        <div class="handover-timeline">
          ${data.handovers.map(h => {
            const car = data.cars.find(c => c.id === h.carId);
            const from = data.drivers.find(d => d.id === h.fromDriverId);
            const to = data.drivers.find(d => d.id === h.toDriverId);

            return `
              <div class="handover-item">
                <div class="handover-time-col">
                  <span class="hov-date">${formatDate(h.timestamp)}</span>
                  <span class="hov-time">${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div class="handover-icon-col">
                  <span class="hov-dot">${icons.swap}</span>
                </div>

                <div class="handover-details-col">
                  <div class="hov-main-row">
                    <span class="hov-car-tag">${car?.plate || 'Car'} (${car?.name.split('-')[0]})</span>
                    <div class="hov-transfer">
                      <span class="person-tag from">
                        <span class="dot" style="background: ${from?.avatarColor || '#aaa'}"></span>
                        ${from ? from.name : 'Unknown'}
                      </span>
                      <span class="arrow">➜</span>
                      <span class="person-tag to">
                        <span class="dot" style="background: ${to?.avatarColor || '#aaa'}"></span>
                        ${to ? to.name : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div class="hov-meta-row">
                    <span>Odometer: <strong>${formatNumber(h.odometerKm)} km</strong></span>
                    <span>Fuel: <strong>${h.fuelPercent}%</strong></span>
                    <span>Condition: <em>${h.condition}</em></span>
                    <span>Fuel Card: <strong>${h.fuelCardPresent ? '✓ Verified Present' : 'Missing'}</strong></span>
                  </div>

                  ${h.notes ? `<div class="hov-notes">"${h.notes}"</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

    </div>
  `;
}
