// Modal Components - Accessible Dialogs for Trip Dispatch, Vehicle Handover, and Receipts
import { store } from '../data/store.js';
import { formatCurrency, formatNumber, formatDate, showToast, icons } from '../utils/helpers.js';

export function setupModals() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <!-- NEW TRIP DISPATCH MODAL -->
    <dialog id="new-trip-dialog" class="modern-dialog">
      <div class="dialog-content">
        <div class="dialog-header">
          <div class="dialog-title-group">
            <span class="dialog-icon-badge">${icons.plus}</span>
            <div>
              <h2 class="dialog-title">Dispatch Take Me Home Trip</h2>
              <p class="dialog-subtitle">Log insurance client chauffeur callout & assign car and driver</p>
            </div>
          </div>
          <button class="dialog-close-btn" data-close-dialog="new-trip-dialog">✕</button>
        </div>

        <form id="new-trip-form" class="dialog-form">
          <div class="form-row-dual">
            <div class="form-group">
              <label class="form-label" for="trip-partner">Insurance Partner *</label>
              <select id="trip-partner" class="form-input" required>
                ${store.data.insurancePartners.map(p => `
                  <option value="${p.id}">${p.name} (${p.badge})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="trip-booking-ref">Insurance Voucher / Booking Ref</label>
              <input type="text" id="trip-booking-ref" class="form-input" placeholder="e.g. DISC-883921" />
            </div>
          </div>

          <div class="form-row-dual">
            <div class="form-group">
              <label class="form-label" for="trip-customer-name">Client / Policyholder Name *</label>
              <input type="text" id="trip-customer-name" class="form-input" placeholder="e.g. Sipho Sithole" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="trip-customer-phone">Client Contact Phone</label>
              <input type="tel" id="trip-customer-phone" class="form-input" placeholder="e.g. +27 82 123 4567" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="trip-customer-car">Client Vehicle to Drive Home *</label>
            <input type="text" id="trip-customer-car" class="form-input" placeholder="e.g. Mercedes C200 Auto / BMW 118i Manual" required />
            <span class="field-hint">Specify make, model & transmission (brother will drive this while chase car follows)</span>
          </div>

          <div class="form-row-dual">
            <div class="form-group">
              <label class="form-label" for="trip-pickup">Pickup Address / Venue *</label>
              <input type="text" id="trip-pickup" class="form-input" placeholder="e.g. The Saxon Hotel, Sandhurst" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="trip-dropoff">Dropoff Home Address *</label>
              <input type="text" id="trip-dropoff" class="form-input" placeholder="e.g. 14 Cedar Lake, Fourways" required />
            </div>
          </div>

          <div class="form-row-triple">
            <div class="form-group">
              <label class="form-label" for="trip-distance">Distance (KM) *</label>
              <input type="number" id="trip-distance" class="form-input" step="0.1" min="1" max="500" value="18.5" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="trip-tolls">Tolls (ZAR)</label>
              <input type="number" id="trip-tolls" class="form-input" step="0.5" min="0" value="0" />
            </div>

            <div class="form-group" style="display: flex; align-items: flex-end; padding-bottom: 0.5rem;">
              <label class="checkbox-container">
                <input type="checkbox" id="trip-night" checked />
                <span class="checkmark"></span>
                <span>Night Surcharge</span>
              </label>
            </div>
          </div>

          <div class="form-row-dual">
            <div class="form-group">
              <label class="form-label" for="trip-driver">Assigned Brother (Chauffeur) *</label>
              <select id="trip-driver" class="form-input" required>
                ${store.data.drivers.map(d => {
                  const isNext = d.id === store.getFairnessAnalysis().recommendedNextDriver?.id;
                  return `
                    <option value="${d.id}" ${isNext ? 'selected' : ''}>
                      ${d.name} ${isNext ? '★ (Recommended Next in Rotation)' : ''}
                    </option>
                  `;
                }).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="trip-car">Escort Vehicle *</label>
              <select id="trip-car" class="form-input" required>
                ${store.data.cars.map(c => `
                  <option value="${c.id}">
                    ${c.name.split('-')[0]} (${c.plate} - ${c.nickname})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="trip-notes">Trip Notes & Dispatch Instructions</label>
            <input type="text" id="trip-notes" class="form-input" placeholder="e.g. Security gate code #4192, client key location" />
          </div>

          <!-- DYNAMIC LIVE FARE PREVIEW -->
          <div class="live-calc-box" id="modal-calc-preview">
            <!-- Will be dynamically updated by JS -->
          </div>

          <div class="dialog-footer">
            <button type="button" class="btn btn-secondary" data-close-dialog="new-trip-dialog">Cancel</button>
            <button type="submit" class="btn btn-gold btn-glow">
              ${icons.check}
              <span>Confirm & Dispatch Trip</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>

    <!-- VEHICLE HANDOVER MODAL -->
    <dialog id="handover-dialog" class="modern-dialog">
      <div class="dialog-content">
        <div class="dialog-header">
          <div class="dialog-title-group">
            <span class="dialog-icon-badge icon-badge-blue">${icons.swap}</span>
            <div>
              <h2 class="dialog-title">Log Vehicle Keys Handover</h2>
              <p class="dialog-subtitle">Record official chain-of-custody, ending mileage & fuel between brothers</p>
            </div>
          </div>
          <button class="dialog-close-btn" data-close-dialog="handover-dialog">✕</button>
        </div>

        <form id="handover-form" class="dialog-form">
          <div class="form-group">
            <label class="form-label" for="hov-car">Select Vehicle to Handover *</label>
            <select id="hov-car" class="form-input" required>
              ${store.data.cars.map(c => `
                <option value="${c.id}">${c.name} (${c.plate})</option>
              `).join('')}
            </select>
          </div>

          <div class="form-row-dual">
            <div class="form-group">
              <label class="form-label" for="hov-from-driver">Handing Over (Outbound Brother) *</label>
              <select id="hov-from-driver" class="form-input" required>
                ${store.data.drivers.map(d => `
                  <option value="${d.id}">${d.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="hov-to-driver">Taking Over (Inbound Brother) *</label>
              <select id="hov-to-driver" class="form-input" required>
                ${store.data.drivers.map(d => `
                  <option value="${d.id}">${d.name}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="form-row-dual">
            <div class="form-group">
              <label class="form-label" for="hov-odometer">Current Odometer (KM) *</label>
              <input type="number" id="hov-odometer" class="form-input" step="1" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="hov-fuel">Fuel Level (%): <strong id="hov-fuel-display">80%</strong></label>
              <input type="range" id="hov-fuel" class="sim-slider" min="5" max="100" value="80" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Handover Checklist</label>
            <div class="checklist-grid">
              <label class="checkbox-container">
                <input type="checkbox" id="chk-keys" checked required />
                <span class="checkmark"></span>
                <span>Vehicle Keys Handed</span>
              </label>
              <label class="checkbox-container">
                <input type="checkbox" id="chk-card" checked required />
                <span class="checkmark"></span>
                <span>Fleet Fuel Card In Glovebox</span>
              </label>
              <label class="checkbox-container">
                <input type="checkbox" id="chk-clean" checked />
                <span class="checkmark"></span>
                <span>Interior Vacuumed & Washed</span>
              </label>
              <label class="checkbox-container">
                <input type="checkbox" id="chk-tires" checked />
                <span class="checkmark"></span>
                <span>Tires & Lights Inspected</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="hov-notes">Handover Location & Handover Notes</label>
            <input type="text" id="hov-notes" class="form-input" placeholder="e.g. Swapped at Shell Garage Fourways. Clean car." />
          </div>

          <div class="dialog-footer">
            <button type="button" class="btn btn-secondary" data-close-dialog="handover-dialog">Cancel</button>
            <button type="submit" class="btn btn-gold btn-glow">
              ${icons.swap}
              <span>Confirm Vehicle Handover</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>

    <!-- TRIP RECEIPT & INSURANCE VOUCHER MODAL -->
    <dialog id="trip-receipt-dialog" class="modern-dialog">
      <div class="dialog-content dialog-content-wide">
        <div class="dialog-header">
          <div class="dialog-title-group">
            <span class="dialog-icon-badge icon-badge-gold">${icons.receipt}</span>
            <div>
              <h2 class="dialog-title">Insurance Trip Voucher & Split Audit</h2>
              <p class="dialog-subtitle">Official Take Me Home billing statement and brother distribution</p>
            </div>
          </div>
          <button class="dialog-close-btn" data-close-dialog="trip-receipt-dialog">✕</button>
        </div>

        <div id="trip-receipt-body" class="receipt-printable-body">
          <!-- Dynamically populated -->
        </div>

        <div class="dialog-footer">
          <button type="button" class="btn btn-secondary" data-close-dialog="trip-receipt-dialog">Close</button>
          <button type="button" class="btn btn-gold" id="btn-print-voucher-action">
            ${icons.receipt}
            <span>Print Official Voucher</span>
          </button>
        </div>
      </div>
    </dialog>

    <!-- EDIT BROTHER MODAL -->
    <dialog id="edit-driver-dialog" class="modern-dialog">
      <div class="dialog-content">
        <div class="dialog-header">
          <div class="dialog-title-group">
            <span class="dialog-icon-badge">${icons.settings}</span>
            <div>
              <h2 class="dialog-title">Edit Brother Details</h2>
              <p class="dialog-subtitle">Update contact info, role and bank payout details</p>
            </div>
          </div>
          <button class="dialog-close-btn" data-close-dialog="edit-driver-dialog">✕</button>
        </div>

        <form id="edit-driver-form" class="dialog-form">
          <input type="hidden" id="edit-driver-id" />

          <div class="form-group">
            <label class="form-label" for="edit-driver-name">Full Name *</label>
            <input type="text" id="edit-driver-name" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-driver-role">Fleet Role *</label>
            <input type="text" id="edit-driver-role" class="form-input" required />
          </div>

          <div class="form-row-dual">
            <div class="form-group">
              <label class="form-label" for="edit-driver-phone">Phone Number *</label>
              <input type="tel" id="edit-driver-phone" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-driver-email">Email Address</label>
              <input type="email" id="edit-driver-email" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-driver-bank">Bank Payout Account (for EFT) *</label>
            <input type="text" id="edit-driver-bank" class="form-input" required placeholder="e.g. FNB - Cheque •••• 4120" />
          </div>

          <div class="dialog-footer">
            <button type="button" class="btn btn-secondary" data-close-dialog="edit-driver-dialog">Cancel</button>
            <button type="submit" class="btn btn-gold">
              ${icons.check}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  `;

  // Bind close buttons
  modalContainer.querySelectorAll('[data-close-dialog]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dialogId = e.currentTarget.getAttribute('data-close-dialog');
      const dialog = document.getElementById(dialogId);
      if (dialog) dialog.close();
    });
  });

  // Light dismiss on backdrop click
  modalContainer.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.close();
      }
    });
  });

  // Bind Live Calculation in New Trip Dialog
  setupNewTripLiveCalculation();

  // Bind Form Submissions
  setupFormSubmissions();
}

function setupNewTripLiveCalculation() {
  const partnerSelect = document.getElementById('trip-partner');
  const distanceInput = document.getElementById('trip-distance');
  const nightCheckbox = document.getElementById('trip-night');
  const tollsInput = document.getElementById('trip-tolls');
  const previewBox = document.getElementById('modal-calc-preview');

  function updatePreview() {
    if (!previewBox) return;
    const partnerId = partnerSelect?.value || store.data.insurancePartners[0].id;
    const distanceKm = parseFloat(distanceInput?.value) || 0;
    const isNight = !!nightCheckbox?.checked;
    const tolls = parseFloat(tollsInput?.value) || 0;

    const calc = store.calculateTripFare({ distanceKm, partnerId, isNight, tolls });

    previewBox.innerHTML = `
      <div class="calc-preview-header">
        <span class="preview-badge">⚡ Instant Rate Calculation</span>
        <span class="preview-fare-sum">${formatCurrency(calc.fare)}</span>
      </div>
      <div class="calc-preview-grid">
        <div class="p-item">
          <span>Active Driver Pay (50%):</span>
          <strong class="text-emerald">${formatCurrency(calc.split.driverPayout)}</strong>
        </div>
        <div class="p-item">
          <span>Brother Pot (10% each):</span>
          <strong class="text-gold">${formatCurrency(calc.split.perBrotherPotShare)}</strong>
        </div>
        <div class="p-item">
          <span>Fuel & Maintenance (20%):</span>
          <strong class="text-cyan">${formatCurrency(calc.split.fuelFund)}</strong>
        </div>
      </div>
    `;
  }

  partnerSelect?.addEventListener('change', updatePreview);
  distanceInput?.addEventListener('input', updatePreview);
  nightCheckbox?.addEventListener('change', updatePreview);
  tollsInput?.addEventListener('input', updatePreview);

  updatePreview();
}

function setupFormSubmissions() {
  // New Trip
  const newTripForm = document.getElementById('new-trip-form');
  if (newTripForm) {
    newTripForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const tripPayload = {
        partnerId: document.getElementById('trip-partner').value,
        bookingRef: document.getElementById('trip-booking-ref').value,
        customerName: document.getElementById('trip-customer-name').value,
        customerPhone: document.getElementById('trip-customer-phone').value,
        customerCarModel: document.getElementById('trip-customer-car').value,
        pickupAddress: document.getElementById('trip-pickup').value,
        dropoffAddress: document.getElementById('trip-dropoff').value,
        distanceKm: document.getElementById('trip-distance').value,
        tolls: document.getElementById('trip-tolls').value,
        isNight: document.getElementById('trip-night').checked,
        driverId: document.getElementById('trip-driver').value,
        carId: document.getElementById('trip-car').value,
        notes: document.getElementById('trip-notes').value,
        status: 'in_progress'
      };

      const newTrip = store.addTrip(tripPayload);
      document.getElementById('new-trip-dialog')?.close();
      newTripForm.reset();
      showToast(`Trip ${newTrip.id} dispatched! Driver assigned: ${store.data.drivers.find(d => d.id === newTrip.driverId)?.name}`);
    });
  }

  // Handover
  const handoverForm = document.getElementById('handover-form');
  const hovCarSelect = document.getElementById('hov-car');
  const hovFromDriver = document.getElementById('hov-from-driver');
  const hovOdo = document.getElementById('hov-odometer');
  const hovFuel = document.getElementById('hov-fuel');
  const hovFuelDisplay = document.getElementById('hov-fuel-display');

  if (hovFuel && hovFuelDisplay) {
    hovFuel.addEventListener('input', (e) => {
      hovFuelDisplay.textContent = `${e.target.value}%`;
    });
  }

  if (hovCarSelect) {
    hovCarSelect.addEventListener('change', (e) => {
      const car = store.data.cars.find(c => c.id === e.target.value);
      if (car) {
        if (hovFromDriver) hovFromDriver.value = car.currentDriverId || store.data.drivers[0].id;
        if (hovOdo) hovOdo.value = car.odometerKm;
        if (hovFuel) {
          hovFuel.value = car.fuelPercent;
          if (hovFuelDisplay) hovFuelDisplay.textContent = `${car.fuelPercent}%`;
        }
      }
    });
  }

  if (handoverForm) {
    handoverForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const carId = document.getElementById('hov-car').value;
      const fromDriverId = document.getElementById('hov-from-driver').value;
      const toDriverId = document.getElementById('hov-to-driver').value;
      const odometerKm = document.getElementById('hov-odometer').value;
      const fuelPercent = document.getElementById('hov-fuel').value;
      const notes = document.getElementById('hov-notes').value;

      if (fromDriverId === toDriverId) {
        showToast('Please select two different brothers for handover', 'error');
        return;
      }

      store.recordHandover({
        carId,
        fromDriverId,
        toDriverId,
        odometerKm,
        fuelPercent,
        condition: 'Keys handed, interior inspected, fuel verified',
        notes
      });

      document.getElementById('handover-dialog')?.close();
      handoverForm.reset();
      showToast(`Vehicle handover logged successfully!`);
    });
  }

  // Edit Brother
  const editDriverForm = document.getElementById('edit-driver-form');
  if (editDriverForm) {
    editDriverForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const driverId = document.getElementById('edit-driver-id').value;
      const name = document.getElementById('edit-driver-name').value;
      const role = document.getElementById('edit-driver-role').value;
      const phone = document.getElementById('edit-driver-phone').value;
      const email = document.getElementById('edit-driver-email').value;
      const payoutBank = document.getElementById('edit-driver-bank').value;

      store.updateDriverDetails(driverId, { name, role, phone, email, payoutBank });
      document.getElementById('edit-driver-dialog')?.close();
      showToast(`Brother details updated!`);
    });
  }

  // Print voucher button
  const printBtn = document.getElementById('btn-print-voucher-action');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

// Open Handover Dialog with preselected Car
export function openHandoverModal(carId = null) {
  const dialog = document.getElementById('handover-dialog');
  if (!dialog) return;

  const carSelect = document.getElementById('hov-car');
  const fromSelect = document.getElementById('hov-from-driver');
  const toSelect = document.getElementById('hov-to-driver');
  const odoInput = document.getElementById('hov-odometer');
  const fuelSlider = document.getElementById('hov-fuel');
  const fuelDisplay = document.getElementById('hov-fuel-display');

  const targetCar = carId ? store.data.cars.find(c => c.id === carId) : store.data.cars[0];

  if (carSelect && targetCar) {
    carSelect.value = targetCar.id;
    if (fromSelect) fromSelect.value = targetCar.currentDriverId || store.data.drivers[0].id;
    if (toSelect) {
      // Pick next brother
      const other = store.data.drivers.find(d => d.id !== targetCar.currentDriverId);
      if (other) toSelect.value = other.id;
    }
    if (odoInput) odoInput.value = targetCar.odometerKm;
    if (fuelSlider) {
      fuelSlider.value = targetCar.fuelPercent;
      if (fuelDisplay) fuelDisplay.textContent = `${targetCar.fuelPercent}%`;
    }
  }

  dialog.showModal();
}

// Open Trip Receipt Modal
export function openTripReceiptModal(tripId) {
  const dialog = document.getElementById('trip-receipt-dialog');
  const body = document.getElementById('trip-receipt-body');
  if (!dialog || !body) return;

  const trip = store.data.trips.find(t => t.id === tripId);
  if (!trip) return;

  const partner = store.data.insurancePartners.find(p => p.id === trip.partnerId);
  const driver = store.data.drivers.find(d => d.id === trip.driverId);
  const car = store.data.cars.find(c => c.id === trip.carId);

  body.innerHTML = `
    <div class="receipt-card">
      <div class="receipt-header">
        <div class="receipt-logo-block">
          <div class="receipt-fleet-name">TAKE ME HOME CHAUFFEUR FLEET</div>
          <div class="receipt-fleet-sub">Three Brothers Chauffeur Operations • Gauteng, South Africa</div>
        </div>
        <div class="receipt-meta-block">
          <div class="receipt-tag">OFFICIAL TRIP VOUCHER</div>
          <div class="receipt-no"><strong>${trip.id}</strong></div>
          <div class="receipt-date">${formatDate(trip.date)} • ${trip.time}</div>
        </div>
      </div>

      <div class="receipt-partner-banner" style="background: ${partner?.color || '#38BDF8'}15; border-left: 4px solid ${partner?.color || '#38BDF8'};">
        <div>
          <span class="lbl">INSURANCE PARTNER</span>
          <h4>${partner?.name} (${partner?.badge})</h4>
        </div>
        <div class="ref-col">
          <span class="lbl">CLAIM / BOOKING REF</span>
          <h4>${trip.bookingRef}</h4>
        </div>
      </div>

      <div class="receipt-section-grid">
        <div class="receipt-section">
          <h5>Client & Vehicle Details</h5>
          <div class="r-row"><span>Client:</span> <strong>${trip.customerName}</strong></div>
          <div class="r-row"><span>Phone:</span> <strong>${trip.customerPhone || 'Direct'}</strong></div>
          <div class="r-row"><span>Customer Car:</span> <strong>${trip.customerCarModel}</strong></div>
        </div>

        <div class="receipt-section">
          <h5>Chauffeur & Escort Car</h5>
          <div class="r-row"><span>Assigned Brother:</span> <strong>${driver?.name}</strong></div>
          <div class="r-row"><span>Brother Contact:</span> <strong>${driver?.phone}</strong></div>
          <div class="r-row"><span>Escort Vehicle:</span> <strong>${car?.plate} (${car?.name})</strong></div>
        </div>
      </div>

      <div class="receipt-route-box">
        <div class="r-row">
          <span>PICKUP LOCATION:</span>
          <strong>${trip.pickupAddress}</strong>
        </div>
        <div class="r-row">
          <span>DROPOFF DESTINATION:</span>
          <strong>${trip.dropoffAddress}</strong>
        </div>
        <div class="r-row">
          <span>RECORDED DISTANCE:</span>
          <strong>${trip.distanceKm} km ${trip.isNight ? '(Late Night Surcharge Applied)' : ''}</strong>
        </div>
      </div>

      <div class="receipt-financial-table">
        <div class="fin-row fin-total">
          <span>Total Insurance Claim Fare:</span>
          <strong>${formatCurrency(trip.fare)}</strong>
        </div>
        <div class="fin-row">
          <span>Driver Direct Commission (50%):</span>
          <span class="text-emerald"><strong>${formatCurrency(trip.split?.driverPayout)}</strong></span>
        </div>
        <div class="fin-row">
          <span>Brotherhood Equal Pot Share (10% each brother):</span>
          <span class="text-gold"><strong>${formatCurrency(trip.split?.perBrotherPotShare)} each</strong></span>
        </div>
        <div class="fin-row text-muted">
          <span>Car Fuel & Maintenance Fund (20%):</span>
          <span>${formatCurrency(trip.split?.fuelFund)}</span>
        </div>
      </div>

      <div class="receipt-signature-row">
        <div class="sig-box">
          <div class="sig-line"></div>
          <span>Client Signature / Acceptance</span>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <span>Chauffeur: ${driver?.name}</span>
        </div>
      </div>
    </div>
  `;

  dialog.showModal();
}

// Open Edit Brother Modal
export function openEditDriverModal(driverId) {
  const dialog = document.getElementById('edit-driver-dialog');
  if (!dialog) return;

  const driver = store.data.drivers.find(d => d.id === driverId);
  if (!driver) return;

  document.getElementById('edit-driver-id').value = driver.id;
  document.getElementById('edit-driver-name').value = driver.name;
  document.getElementById('edit-driver-role').value = driver.role;
  document.getElementById('edit-driver-phone').value = driver.phone;
  document.getElementById('edit-driver-email').value = driver.email || '';
  document.getElementById('edit-driver-bank').value = driver.payoutBank || '';

  dialog.showModal();
}
