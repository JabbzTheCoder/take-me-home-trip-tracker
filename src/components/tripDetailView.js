// Trip Detail View Component - Dedicated View for Trip Details, Audit, Notes & PDF Voucher
import { api } from '../data/api.js';
import { formatCurrency, showToast, icons } from '../utils/helpers.js';
import { openPrintVoucher } from './printVoucherModal.js';

export function setupTripDetailModal(onTripUpdated) {
  let modal = document.getElementById('trip-detail-dialog');
  if (!modal) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'trip-detail-wrapper';
    wrapper.innerHTML = `
      <dialog id="trip-detail-dialog" class="simple-mobile-dialog trip-detail-dialog-card">
        <div class="modal-card detail-modal-card">
          <!-- Injected dynamically in openTripDetail -->
          <div id="trip-detail-body"></div>
        </div>
      </dialog>
    `;
    container.appendChild(wrapper);
    modal = document.getElementById('trip-detail-dialog');
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

export function openTripDetail(trip, onTripUpdated) {
  setupTripDetailModal(onTripUpdated);
  const modal = document.getElementById('trip-detail-dialog');
  const body = document.getElementById('trip-detail-body');
  if (!modal || !body) return;

  const isTakeMeHome = trip.type === 'take_me_home';
  const tripId = trip._id || trip.id;
  const isDone = trip.status === 'completed';

  body.innerHTML = `
    <!-- Top Bar -->
    <div class="detail-top-nav">
      <button type="button" class="btn-back-link" id="btn-back-detail">
        <span class="back-arrow">←</span>
        <span>Back to Trips</span>
      </button>
      <div class="detail-header-right">
        <span class="status-pill status-${trip.status}">
          ${isDone ? '✓ Completed' : '● In Transit'}
        </span>
        <button type="button" class="modal-close" id="btn-close-detail">✕</button>
      </div>
    </div>

    <!-- Hero Header -->
    <div class="detail-hero-banner ${isTakeMeHome ? 'hero-tmh' : 'hero-chauffeur'}">
      <div class="hero-type-row">
        <span class="type-tag">${isTakeMeHome ? '🚗 TAKE ME HOME' : '🎩 CHAUFFEUR'}</span>
        <span class="detail-time-tag">${trip.date} • ${trip.time}</span>
      </div>
      <h2 class="detail-client-name">${trip.clientName}</h2>
      ${trip.clientPhone ? `
        <a href="tel:${trip.clientPhone}" class="detail-phone-btn">
          <span>📞 Call ${trip.clientPhone}</span>
        </a>
      ` : ''}
      ${isTakeMeHome && trip.clientCar ? `
        <div class="detail-client-car-badge">
          <span>Client Car: <strong>${trip.clientCar}</strong></span>
        </div>
      ` : ''}
    </div>

    <!-- Route Section -->
    <div class="detail-section-box">
      <span class="section-micro-lbl">TRANSIT ROUTE</span>
      <div class="detail-route-flow">
        <div class="route-step">
          <span class="route-marker pickup-marker"></span>
          <div>
            <span class="route-lbl">PICKUP VENUE</span>
            <p class="route-addr">${trip.pickup}</p>
          </div>
        </div>
        <div class="route-step-line"></div>
        <div class="route-step">
          <span class="route-marker dropoff-marker"></span>
          <div>
            <span class="route-lbl">DESTINATION</span>
            <p class="route-addr">${trip.dropoff}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Who Done It Section -->
    <div class="detail-section-box who-box-accent">
      <div class="section-title-row">
        <span class="section-micro-lbl">WHO DONE THIS TRIP</span>
        <span class="who-count-badge">${isTakeMeHome ? '2 Drivers' : '1 Driver'}</span>
      </div>

      ${isTakeMeHome ? `
        <div class="detail-dual-drivers">
          <div class="detail-driver-item">
            <div class="driver-num-badge">1</div>
            <div>
              <span class="driver-role-title">Drove Client's Car</span>
              <strong class="driver-name-highlight">${trip.clientDriverName || 'Lead Driver'}</strong>
            </div>
          </div>

          <div class="detail-driver-item">
            <div class="driver-num-badge badge-chase">2</div>
            <div>
              <span class="driver-role-title">Drove Escort Chase Car</span>
              <strong class="driver-name-highlight">${trip.chaseDriverName || 'Chase Driver'}</strong>
              <small class="chase-car-text">${trip.chaseCar || 'Fleet Escort'}</small>
            </div>
          </div>
        </div>
      ` : `
        <div class="detail-driver-item">
          <div class="driver-num-badge">🎩</div>
          <div>
            <span class="driver-role-title">Chauffeur Driver</span>
            <strong class="driver-name-highlight">${trip.driverName || 'Driver'}</strong>
            <small class="chase-car-text">Fleet Car: ${trip.car || 'Commercial Fleet'}</small>
          </div>
        </div>
      `}
    </div>

    <!-- Prominent Trip Notes with Live Edit -->
    <div class="detail-section-box notes-box-gold">
      <div class="section-title-row">
        <span class="section-micro-lbl">📝 TRIP NOTES & SPECIAL INSTRUCTIONS</span>
        <button type="button" class="btn-text-edit" id="btn-edit-notes-toggle">Edit</button>
      </div>

      <div id="notes-view-mode">
        <p class="detail-notes-text">
          ${trip.notes && trip.notes.trim() ? trip.notes : '<em>No notes recorded for this trip yet.</em>'}
        </p>
      </div>

      <form id="form-edit-notes" class="edit-notes-form hidden">
        <textarea id="inp-edit-notes" class="modal-inp" rows="3" placeholder="Enter gate codes, key handover info, etc...">${trip.notes || ''}</textarea>
        <div class="edit-notes-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-notes-edit">Cancel</button>
          <button type="submit" class="btn btn-gold btn-sm">Save Notes</button>
        </div>
      </form>
    </div>

    <!-- Fare & Financials -->
    <div class="detail-fare-card">
      <span class="fare-card-lbl">Agreed Rate / Fare</span>
      <span class="fare-card-val">${formatCurrency(trip.fare)}</span>
    </div>

    <!-- Actions Row -->
    <div class="detail-actions-stack">
      <button type="button" class="btn btn-gold btn-full btn-glow" id="btn-detail-print-pdf">
        ${icons.receipt}
        <span>Print Official PDF Voucher</span>
      </button>

      <div class="detail-actions-row">
        <button type="button" class="btn ${isDone ? 'btn-secondary' : 'btn-emerald'} btn-full" id="btn-detail-toggle-status">
          ${icons.check}
          <span>${isDone ? 'Mark In Progress' : 'Mark Completed'}</span>
        </button>

        <button type="button" class="btn btn-danger-outline" id="btn-detail-delete-trip" title="Delete Trip Record">
          🗑️
        </button>
      </div>
    </div>
  `;

  // Bind events
  body.querySelector('#btn-back-detail')?.addEventListener('click', () => modal.close());
  body.querySelector('#btn-close-detail')?.addEventListener('click', () => modal.close());

  // Print PDF button
  body.querySelector('#btn-detail-print-pdf')?.addEventListener('click', () => {
    openPrintVoucher(trip);
  });

  // Toggle notes edit form
  const toggleNotesBtn = body.querySelector('#btn-edit-notes-toggle');
  const notesView = body.querySelector('#notes-view-mode');
  const notesForm = body.querySelector('#form-edit-notes');
  const cancelNotesBtn = body.querySelector('#btn-cancel-notes-edit');

  toggleNotesBtn?.addEventListener('click', () => {
    notesView?.classList.toggle('hidden');
    notesForm?.classList.toggle('hidden');
  });

  cancelNotesBtn?.addEventListener('click', () => {
    notesView?.classList.remove('hidden');
    notesForm?.classList.add('hidden');
  });

  notesForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newNotes = body.querySelector('#inp-edit-notes')?.value || '';
    try {
      await api.updateTrip(tripId, { notes: newNotes });
      trip.notes = newNotes;
      showToast('Trip notes updated!');
      openTripDetail(trip, onTripUpdated);
      if (onTripUpdated) onTripUpdated();
    } catch (err) {
      showToast(err.message || 'Failed to update notes', 'error');
    }
  });

  // Toggle Status
  body.querySelector('#btn-detail-toggle-status')?.addEventListener('click', async () => {
    const newStatus = isDone ? 'in_progress' : 'completed';
    try {
      await api.updateTrip(tripId, { status: newStatus });
      trip.status = newStatus;
      showToast(`Trip marked as ${newStatus === 'completed' ? 'Completed' : 'In Progress'}!`);
      openTripDetail(trip, onTripUpdated);
      if (onTripUpdated) onTripUpdated();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  });

  // Delete trip
  body.querySelector('#btn-detail-delete-trip')?.addEventListener('click', async () => {
    if (confirm('Delete this trip record permanently from MongoDB?')) {
      try {
        await api.deleteTrip(tripId);
        showToast('Trip record deleted');
        modal.close();
        if (onTripUpdated) onTripUpdated();
      } catch (err) {
        showToast(err.message || 'Failed to delete trip', 'error');
      }
    }
  });

  modal.showModal();
}
