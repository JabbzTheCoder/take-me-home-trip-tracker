// Simple Modal Component - Fast Mobile Trip Logger for Take Me Home (2 Drivers) or Chauffeur (1 Driver)
import { api } from '../data/api.js';
import { showToast, icons } from '../utils/helpers.js';

let selectedModalType = 'take_me_home'; // 'take_me_home' | 'chauffeur'
let cachedBrothers = [];
let cachedCars = [];

export async function setupTripModal(onTripCreated) {
  try {
    const [brothersRes, carsRes] = await Promise.all([
      api.getBrothers().catch(() => []),
      api.getCars().catch(() => [])
    ]);
    cachedBrothers = brothersRes && brothersRes.length > 0 ? brothersRes : [
      { _id: 'usr-jabbz-01', name: 'Jabbz', role: 'Admin Chauffeur' },
      { _id: 'usr-tebza-02', name: 'Tebza', role: 'Admin Chauffeur' },
      { _id: 'usr-fresh-03', name: 'Fresh', role: 'Admin Chauffeur' }
    ];
    cachedCars = carsRes && carsRes.length > 0 ? carsRes : [
      { name: 'VW Polo', plate: 'GP 884-POL', model: '1.0 TSI' },
      { name: 'Ford Fiesta', plate: 'GP 419-FIE', model: 'EcoBoost' },
      { name: 'Hyundai i20', plate: 'GP 302-I20', model: '1.2 Motion' }
    ];
  } catch (e) {
    console.warn('Could not load dynamic data from API, using defaults', e);
  }

  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  let wrapper = document.getElementById('trip-dialog-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'trip-dialog-wrapper';
    modalContainer.appendChild(wrapper);
  }

  // Render modal HTML inside dedicated wrapper
  wrapper.innerHTML = renderModalHtml();
  bindModalEvents(onTripCreated);
}

function renderModalHtml() {
  const currentUser = api.getCurrentUser();
  const currentUserId = currentUser?._id || cachedBrothers[0]._id;
  const otherBrother = cachedBrothers.find(b => String(b._id) !== String(currentUserId)) || cachedBrothers[1] || cachedBrothers[0];

  return `
    <dialog id="simple-trip-dialog" class="simple-mobile-dialog">
      <div class="modal-card">
        
        <!-- Header -->
        <div class="modal-top-bar">
          <div>
            <h2 class="modal-heading">Log New Trip</h2>
            <small class="text-gold">Admin Dispatch • Dynamic Fleet</small>
          </div>
          <button type="button" class="modal-close" id="btn-close-modal">✕</button>
        </div>

        <!-- Trip Type Segmented Switcher -->
        <div class="type-segmented-control">
          <button 
            type="button" 
            class="seg-btn ${selectedModalType === 'take_me_home' ? 'active' : ''}" 
            data-type="take_me_home"
          >
            <span>🚗 Take Me Home</span>
            <small>(2 Drivers Dispatched)</small>
          </button>

          <button 
            type="button" 
            class="seg-btn ${selectedModalType === 'chauffeur' ? 'active' : ''}" 
            data-type="chauffeur"
          >
            <span>🎩 Chauffeur</span>
            <small>(1 Driver Dispatched)</small>
          </button>
        </div>

        <form id="simple-trip-form" class="modal-form">
          
          ${selectedModalType === 'take_me_home' ? `
            <!-- TAKE ME HOME FORM (2 DRIVERS) -->
            <div class="form-callout-hint">
              <span class="hint-icon">💡</span>
              <span><strong>Take Me Home:</strong> Drive the client in their own car. Requires 2 drivers (Lead Driver in client's car + Chase Car Escort).</span>
            </div>

            <!-- Client & Vehicle -->
            <div class="form-field">
              <label class="form-lbl" for="inp-client-name">Client / Passenger Name *</label>
              <input type="text" id="inp-client-name" class="modal-inp" placeholder="e.g. Dr. Michael Ndlovu" required />
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label class="form-lbl" for="inp-client-phone">Client Phone</label>
                <input type="tel" id="inp-client-phone" class="modal-inp" placeholder="e.g. 082 123 4567" />
              </div>

              <div class="form-field">
                <label class="form-lbl" for="inp-client-car">Client Car Model *</label>
                <input type="text" id="inp-client-car" class="modal-inp" placeholder="e.g. Audi Q7 / BMW X3" required />
              </div>
            </div>

            <!-- Route -->
            <div class="form-field">
              <label class="form-lbl" for="inp-pickup">Pickup Address / Venue *</label>
              <input type="text" id="inp-pickup" class="modal-inp" placeholder="e.g. Rosebank Mall / Tiger's Milk" required />
            </div>

            <div class="form-field">
              <label class="form-lbl" for="inp-dropoff">Dropoff Address *</label>
              <input type="text" id="inp-dropoff" class="modal-inp" placeholder="e.g. Bryanston, Sandton" required />
            </div>

            <!-- THE TWO DRIVERS (WHO DONE IT) -->
            <div class="two-drivers-selector-box">
              <span class="box-title">ASSIGN THE 2 DRIVERS (WHO DONE THIS):</span>
              
              <div class="form-field">
                <label class="form-lbl">Driver 1: Drove Client's Car *</label>
                <select id="inp-client-driver" class="modal-select" required>
                  ${cachedBrothers.map(b => `
                    <option value="${b._id}" data-name="${b.name}" ${String(b._id) === String(currentUserId) ? 'selected' : ''}>
                      ${b.name} (Client Car Chauffeur)
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-field">
                <label class="form-lbl">Driver 2: Drove Chase Escort Car *</label>
                <select id="inp-chase-driver" class="modal-select" required>
                  ${cachedBrothers.map(b => `
                    <option value="${b._id}" data-name="${b.name}" ${String(b._id) === String(otherBrother._id) ? 'selected' : ''}>
                      ${b.name} (Chase Car Escort)
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-field">
                <label class="form-lbl">Our Fleet Chase Vehicle *</label>
                <select id="inp-chase-car" class="modal-select" required>
                  ${cachedCars.map(c => `
                    <option value="${c.name} (${c.plate})">${c.name} (${c.plate})</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Prominent Notes Field (Requested by User) -->
            <div class="form-field">
              <label class="form-lbl" for="inp-notes">📝 Trip Notes & Special Instructions</label>
              <textarea 
                id="inp-notes" 
                class="modal-inp" 
                rows="2" 
                placeholder="e.g. Client keys handed to security. Gate code #4192. Vehicle inspected."
              ></textarea>
            </div>

            <!-- Fare & Status -->
            <div class="form-row-2">
              <div class="form-field">
                <label class="form-lbl" for="inp-fare">Trip Rate / Fare (ZAR) *</label>
                <input type="number" id="inp-fare" class="modal-inp" step="10" value="450" required />
              </div>

              <div class="form-field">
                <label class="form-lbl">Status</label>
                <select id="inp-status" class="modal-select">
                  <option value="completed">✓ Completed</option>
                  <option value="in_progress">● Currently on Road</option>
                </select>
              </div>
            </div>
          ` : `
            <!-- CHAUFFEUR FORM (1 DRIVER) -->
            <div class="form-callout-hint hint-cyan">
              <span class="hint-icon">🎩</span>
              <span><strong>Chauffeur:</strong> Transporting client using our own commercial fleet car (1 driver).</span>
            </div>

            <div class="form-field">
              <label class="form-lbl" for="inp-client-name">Client / Passenger Name *</label>
              <input type="text" id="inp-client-name" class="modal-inp" placeholder="e.g. Advocate Maluleke" required />
            </div>

            <div class="form-field">
              <label class="form-lbl" for="inp-client-phone">Client Phone</label>
              <input type="tel" id="inp-client-phone" class="modal-inp" placeholder="e.g. 083 456 7890" />
            </div>

            <!-- Route -->
            <div class="form-field">
              <label class="form-lbl" for="inp-pickup">Pickup Location *</label>
              <input type="text" id="inp-pickup" class="modal-inp" placeholder="e.g. The Saxon Hotel, Sandhurst" required />
            </div>

            <div class="form-field">
              <label class="form-lbl" for="inp-dropoff">Dropoff Address *</label>
              <input type="text" id="inp-dropoff" class="modal-inp" placeholder="e.g. Steyn City" required />
            </div>

            <!-- 1 DRIVER & CAR -->
            <div class="two-drivers-selector-box box-cyan">
              <span class="box-title">ASSIGN CHAUFFEUR DRIVER:</span>

              <div class="form-field">
                <label class="form-lbl">Chauffeur Driver *</label>
                <select id="inp-solo-driver" class="modal-select" required>
                  ${cachedBrothers.map(b => `
                    <option value="${b._id}" data-name="${b.name}" ${String(b._id) === String(currentUserId) ? 'selected' : ''}>
                      ${b.name} (Driver)
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-field">
                <label class="form-lbl">Fleet Vehicle Used *</label>
                <select id="inp-solo-car" class="modal-select" required>
                  ${cachedCars.map(c => `
                    <option value="${c.name} (${c.plate})">${c.name} (${c.plate})</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Prominent Notes Field -->
            <div class="form-field">
              <label class="form-lbl" for="inp-notes">📝 Trip Notes & Special Instructions</label>
              <textarea 
                id="inp-notes" 
                class="modal-inp" 
                rows="2" 
                placeholder="e.g. VIP client requested quiet ride. Paid via corporate account."
              ></textarea>
            </div>

            <!-- Fare & Status -->
            <div class="form-row-2">
              <div class="form-field">
                <label class="form-lbl" for="inp-fare">Trip Rate / Fare (ZAR) *</label>
                <input type="number" id="inp-fare" class="modal-inp" step="10" value="380" required />
              </div>

              <div class="form-field">
                <label class="form-lbl">Status</label>
                <select id="inp-status" class="modal-select">
                  <option value="completed">✓ Completed</option>
                  <option value="in_progress">● Currently on Road</option>
                </select>
              </div>
            </div>
          `}

          <!-- POPIA Compliance Notice (Act 4 of 2013) -->
          <div class="popia-form-notice">
            <span class="notice-shield">🛡️</span>
            <span><strong>POPIA Act 4 of 2013 Notice:</strong> Passenger details and residential route coordinates are captured strictly for transit dispatch and insurance claim audit under lawful processing conditions.</span>
          </div>

          <!-- Submit Buttons -->
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary btn-full" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-gold btn-full btn-glow" id="btn-submit-trip">
              ${icons.check}
              <span>Save & Dispatch Trip</span>
            </button>
          </div>

        </form>

      </div>
    </dialog>
  `;
}

function bindModalEvents(onTripCreated) {
  const dialog = document.getElementById('simple-trip-dialog');
  if (!dialog) return;

  // Segmented Type toggle buttons
  dialog.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedModalType = e.currentTarget.dataset.type;
      setupTripModal(onTripCreated);
      document.getElementById('simple-trip-dialog')?.showModal();
    });
  });

  // Close button
  dialog.querySelector('#btn-close-modal')?.addEventListener('click', () => dialog.close());
  dialog.querySelector('#btn-cancel-modal')?.addEventListener('click', () => dialog.close());

  // Light dismiss on backdrop
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  // Form submit
  const form = dialog.querySelector('#simple-trip-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = dialog.querySelector('#btn-submit-trip');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving to MongoDB...';
    }

    try {
      let tripPayload = {
        type: selectedModalType,
        clientName: dialog.querySelector('#inp-client-name')?.value,
        clientPhone: dialog.querySelector('#inp-client-phone')?.value,
        pickup: dialog.querySelector('#inp-pickup')?.value,
        dropoff: dialog.querySelector('#inp-dropoff')?.value,
        fare: dialog.querySelector('#inp-fare')?.value,
        status: dialog.querySelector('#inp-status')?.value,
        notes: dialog.querySelector('#inp-notes')?.value || '' // Notes field
      };

      if (selectedModalType === 'take_me_home') {
        const clientDriverSelect = dialog.querySelector('#inp-client-driver');
        const chaseDriverSelect = dialog.querySelector('#inp-chase-driver');

        const clientDriverId = clientDriverSelect?.value;
        const chaseDriverId = chaseDriverSelect?.value;

        if (clientDriverId === chaseDriverId) {
          showToast('Please choose two different drivers for Take Me Home (Driver + Chase)', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save & Dispatch Trip';
          }
          return;
        }

        tripPayload.clientCar = dialog.querySelector('#inp-client-car')?.value;
        tripPayload.clientDriverId = clientDriverId;
        tripPayload.clientDriverName = clientDriverSelect?.selectedOptions[0]?.dataset?.name || 'Driver 1';
        tripPayload.chaseDriverId = chaseDriverId;
        tripPayload.chaseDriverName = chaseDriverSelect?.selectedOptions[0]?.dataset?.name || 'Driver 2';
        tripPayload.chaseCar = dialog.querySelector('#inp-chase-car')?.value;
      } else {
        const soloSelect = dialog.querySelector('#inp-solo-driver');
        tripPayload.driverId = soloSelect?.value;
        tripPayload.driverName = soloSelect?.selectedOptions[0]?.dataset?.name || 'Driver';
        tripPayload.car = dialog.querySelector('#inp-solo-car')?.value;
      }

      await api.createTrip(tripPayload);
      dialog.close();
      showToast('Trip logged successfully in MongoDB!');
      if (onTripCreated) onTripCreated();
    } catch (err) {
      showToast(err.message || 'Error saving trip', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save & Dispatch Trip';
      }
    }
  });
}

