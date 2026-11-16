// Rates & Insurance Partners View - Rate Cards, Billing Models, and Split Engine
import { store } from '../data/store.js';
import { formatCurrency, icons } from '../utils/helpers.js';

let simDistance = 24;
let simPartnerId = 'partner-discovery';
let simIsNight = true;
let simTolls = 0;

export function renderRates() {
  const data = store.data;
  const currentSplitModel = data.splitConfig.model;

  // Run simulation
  const simResult = store.calculateTripFare({
    distanceKm: simDistance,
    partnerId: simPartnerId,
    isNight: simIsNight,
    tolls: simTolls
  });

  return `
    <div class="rates-container animate-fade-in">
      
      <!-- HEADER -->
      <div class="page-top-header">
        <div>
          <h1 class="page-title">Rates & Insurance Partner Rules</h1>
          <p class="page-subtitle">Configure billing rates, km thresholds, night surcharges, and the brotherhood profit distribution model</p>
        </div>

        <button class="btn btn-secondary btn-sm" id="btn-reset-fleet-data">
          <span>↺ Reset Sample Data</span>
        </button>
      </div>

      <!-- INTERACTIVE FARE & SPLIT SIMULATOR -->
      <section class="simulator-card card-glow-gold">
        <div class="simulator-header">
          <div class="sim-title-group">
            <span class="sim-badge">${icons.sparkles} LIVE FARE SIMULATOR</span>
            <h2 class="sim-title">Test Insurance Trip Billing & Brother Split</h2>
          </div>
          <span class="sim-sub">Real-time calculation using configured contract rates</span>
        </div>

        <div class="simulator-body">
          <div class="sim-inputs-grid">
            <div class="sim-field">
              <label class="sim-label">Insurance Provider</label>
              <select id="sim-partner-select" class="filter-select">
                ${data.insurancePartners.map(p => `
                  <option value="${p.id}" ${simPartnerId === p.id ? 'selected' : ''}>${p.name} (${p.badge})</option>
                `).join('')}
              </select>
            </div>

            <div class="sim-field">
              <label class="sim-label">Trip Distance (KM): <strong id="sim-dist-display">${simDistance} km</strong></label>
              <input type="range" id="sim-dist-slider" min="5" max="90" value="${simDistance}" class="sim-slider" />
            </div>

            <div class="sim-field-checkbox">
              <label class="checkbox-container">
                <input type="checkbox" id="sim-night-toggle" ${simIsNight ? 'checked' : ''} />
                <span class="checkmark"></span>
                <span>${icons.moon} Late Night Surcharge (23:00 - 04:00)</span>
              </label>
            </div>
          </div>

          <!-- SIMULATION RESULT BOX -->
          <div class="sim-results-ribbon">
            <div class="sim-result-total">
              <span class="lbl">Total Insurance Billing</span>
              <span class="val text-gold">${formatCurrency(simResult.fare)}</span>
              <span class="formula-tag">${simResult.partner.name} Contract Rate</span>
            </div>

            <div class="sim-result-breakdown">
              <div class="res-col">
                <span class="res-label">Car Fuel Reserve (20%)</span>
                <span class="res-val text-cyan">${formatCurrency(simResult.split.fuelFund)}</span>
                <span class="res-sub">Vehicle maintenance pool</span>
              </div>
              <div class="res-col">
                <span class="res-label">Active Driver (50%)</span>
                <span class="res-val text-emerald">${formatCurrency(simResult.split.driverPayout)}</span>
                <span class="res-sub">Immediate driver commission</span>
              </div>
              <div class="res-col">
                <span class="res-label">Brotherhood Pot (30%)</span>
                <span class="res-val text-gold">${formatCurrency(simResult.split.brotherPot)}</span>
                <span class="res-sub"><strong>${formatCurrency(simResult.split.perBrotherPotShare)}</strong> per brother (1/3 each)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SPLIT FORMULA MODEL SELECTOR -->
      <section class="dash-card mt-6">
        <div class="dash-card-header">
          <div>
            <h2 class="dash-card-title">Brotherhood Distribution Formula</h2>
            <p class="dash-card-subtitle">Choose how trips and profits are rated and split among the three brothers</p>
          </div>
          <span class="badge-tag">Current Model: ${currentSplitModel === 'balanced_pot' ? 'Balanced Pot' : currentSplitModel === 'equal_pot' ? 'Equal 3-Way' : 'Driver Focus'}</span>
        </div>

        <div class="split-models-grid">
          <!-- Model 1 -->
          <div class="split-model-option ${currentSplitModel === 'balanced_pot' ? 'model-active' : ''}" data-model="balanced_pot">
            <div class="model-badge">RECOMMENDED</div>
            <h3 class="model-title">Balanced Pot (50% Driver / 30% Equal Pot / 20% Car)</h3>
            <p class="model-desc">
              The brother driving earns 50% for his time behind the wheel. 30% goes into the shared pot divided equally (10% each), and 20% stays with the car for fuel and tires. Rewards hard work while keeping the brotherhood unified!
            </p>
            <div class="model-bar">
              <span class="seg green" style="width: 50%">50% Driver</span>
              <span class="seg gold" style="width: 30%">30% Pot</span>
              <span class="seg blue" style="width: 20%">20% Car</span>
            </div>
            <button class="btn btn-outline btn-xs btn-select-model" data-model="balanced_pot">
              ${currentSplitModel === 'balanced_pot' ? '✓ Currently Active' : 'Activate Model'}
            </button>
          </div>

          <!-- Model 2 -->
          <div class="split-model-option ${currentSplitModel === 'equal_pot' ? 'model-active' : ''}" data-model="equal_pot">
            <h3 class="model-title">Pure Equal 3-Way Split (1/3 Each After 20% Car)</h3>
            <p class="model-desc">
              All trip earnings are pooled together into one central family pot. After deducting 20% for fuel and vehicle upkeep, the remaining 80% is split exactly 33.33% to each brother.
            </p>
            <div class="model-bar">
              <span class="seg gold" style="width: 80%">80% Equal Brother Pool (26.6% each)</span>
              <span class="seg blue" style="width: 20%">20% Car</span>
            </div>
            <button class="btn btn-outline btn-xs btn-select-model" data-model="equal_pot">
              ${currentSplitModel === 'equal_pot' ? '✓ Currently Active' : 'Activate Model'}
            </button>
          </div>

          <!-- Model 3 -->
          <div class="split-model-option ${currentSplitModel === 'driver_keep' ? 'model-active' : ''}" data-model="driver_keep">
            <h3 class="model-title">Driver Individual Keep (80% Driver / 20% Car)</h3>
            <p class="model-desc">
              Whoever drives the trip keeps 80% of the entire fare, and contributes 20% to the fleet car fund. No shared pot. Fair rotation is maintained strictly by balancing the number of calls assigned.
            </p>
            <div class="model-bar">
              <span class="seg green" style="width: 80%">80% Active Driver</span>
              <span class="seg blue" style="width: 20%">20% Car</span>
            </div>
            <button class="btn btn-outline btn-xs btn-select-model" data-model="driver_keep">
              ${currentSplitModel === 'driver_keep' ? '✓ Currently Active' : 'Activate Model'}
            </button>
          </div>
        </div>
      </section>

      <!-- INSURANCE PARTNERS RATE CARDS -->
      <section class="dash-card mt-6">
        <div class="dash-card-header">
          <div>
            <h2 class="dash-card-title">Insurance Partners & Billing Tiers</h2>
            <p class="dash-card-subtitle">Active contracts with insurance providers for Take Me Home / Drive-Dry client pick-ups</p>
          </div>
          <span class="badge-tag">${data.insurancePartners.length} Insurance Programs</span>
        </div>

        <div class="partners-grid">
          ${data.insurancePartners.map(partner => `
            <div class="partner-card">
              <div class="partner-card-header">
                <div>
                  <h3 class="partner-name">${partner.name}</h3>
                  <span class="partner-badge-sub" style="color: ${partner.color}">${partner.badge}</span>
                </div>
                <span class="partner-color-tag" style="background: ${partner.color}"></span>
              </div>

              <div class="partner-rates-list">
                <div class="p-rate-row">
                  <span>Base Callout Fare:</span>
                  <strong>${formatCurrency(partner.baseFare)}</strong>
                </div>
                <div class="p-rate-row">
                  <span>Included Distance:</span>
                  <strong>First ${partner.includedKm} km free</strong>
                </div>
                <div class="p-rate-row">
                  <span>Rate After Included KM:</span>
                  <strong>${formatCurrency(partner.perKmRate)} / km</strong>
                </div>
                <div class="p-rate-row">
                  <span>Late Night Surcharge:</span>
                  <strong>+ ${formatCurrency(partner.nightSurcharge)}</strong>
                </div>
                <div class="p-rate-row">
                  <span>Contract Ref:</span>
                  <span class="text-muted">${partner.contractRef}</span>
                </div>
              </div>

              <div class="partner-card-footer">
                <button class="btn btn-outline btn-xs btn-edit-partner" data-partner-id="${partner.id}">
                  Edit Contract Rates
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

    </div>
  `;
}

export function bindRatesEvents(container) {
  const distSlider = container.querySelector('#sim-dist-slider');
  const distDisplay = container.querySelector('#sim-dist-display');
  const partnerSelect = container.querySelector('#sim-partner-select');
  const nightToggle = container.querySelector('#sim-night-toggle');

  if (distSlider && distDisplay) {
    distSlider.addEventListener('input', (e) => {
      simDistance = parseInt(e.target.value, 10);
      distDisplay.textContent = `${simDistance} km`;
      container.innerHTML = renderRates();
      bindRatesEvents(container);
    });
  }

  if (partnerSelect) {
    partnerSelect.addEventListener('change', (e) => {
      simPartnerId = e.target.value;
      container.innerHTML = renderRates();
      bindRatesEvents(container);
    });
  }

  if (nightToggle) {
    nightToggle.addEventListener('change', (e) => {
      simIsNight = e.target.checked;
      container.innerHTML = renderRates();
      bindRatesEvents(container);
    });
  }

  const modelButtons = container.querySelectorAll('.btn-select-model');
  modelButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const model = e.currentTarget.dataset.model;
      store.updateSplitConfig({ model });
      container.innerHTML = renderRates();
      bindRatesEvents(container);
    });
  });
}
