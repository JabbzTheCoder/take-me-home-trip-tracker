// Dynamic Cars Fleet Management Modal - Full Admin Powers for All Users
import { api } from '../data/api.js';
import { showToast, icons } from '../utils/helpers.js';

export function setupCarsModal(onCarsUpdated) {
  let modal = document.getElementById('fleet-cars-dialog');
  if (!modal) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <dialog id="fleet-cars-dialog" class="simple-mobile-dialog">
        <div class="modal-card">
          <div class="modal-top-bar">
            <div>
              <h2 class="modal-heading">Fleet Cars Management</h2>
              <small class="text-gold">Admin Controls • Polo, Fiesta, i20 & More</small>
            </div>
            <button type="button" class="modal-close" id="btn-close-cars-modal">✕</button>
          </div>

          <!-- Add Car Form -->
          <form id="form-add-car" class="add-car-box">
            <span class="box-title">+ ADD NEW FLEET VEHICLE:</span>
            <div class="form-row-2">
              <div class="form-field">
                <label class="form-lbl" for="inp-car-name">Car Name *</label>
                <input type="text" id="inp-car-name" class="modal-inp" placeholder="e.g. VW Polo" required />
              </div>
              <div class="form-field">
                <label class="form-lbl" for="inp-car-plate">License Plate *</label>
                <input type="text" id="inp-car-plate" class="modal-inp" placeholder="e.g. GP 884-POL" required />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label class="form-lbl" for="inp-car-model">Model / Trim</label>
                <input type="text" id="inp-car-model" class="modal-inp" placeholder="e.g. 1.0 TSI" />
              </div>
              <div class="form-field">
                <label class="form-lbl" for="inp-car-color">Color</label>
                <input type="text" id="inp-car-color" class="modal-inp" placeholder="e.g. White" />
              </div>
            </div>

            <button type="submit" class="btn btn-gold btn-sm mt-1" id="btn-save-new-car">
              ${icons.plus}
              <span>Add Vehicle</span>
            </button>
          </form>

          <!-- Current Cars List -->
          <div class="dynamic-cars-list-box">
            <span class="box-title">CURRENT FLEET CARS:</span>
            <div id="dynamic-cars-container" class="dynamic-cars-stack">
              <div class="loading-state-sm">Loading cars...</div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary btn-full" id="btn-done-cars-modal">Close</button>
          </div>
        </div>
      </dialog>
    `;
    container.appendChild(wrapper.firstElementChild);
    modal = document.getElementById('fleet-cars-dialog');
  }

  modal.querySelector('#btn-close-cars-modal')?.addEventListener('click', () => modal.close());
  modal.querySelector('#btn-done-cars-modal')?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  const form = modal.querySelector('#form-add-car');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = modal.querySelector('#inp-car-name')?.value;
    const plate = modal.querySelector('#inp-car-plate')?.value;
    const model = modal.querySelector('#inp-car-model')?.value;
    const color = modal.querySelector('#inp-car-color')?.value;

    try {
      await api.createCar({ name, plate, model, color });
      showToast(`${name} added to fleet!`);
      form.reset();
      await refreshCarsList(modal, onCarsUpdated);
      if (onCarsUpdated) onCarsUpdated();
    } catch (err) {
      showToast(err.message || 'Failed to add car', 'error');
    }
  });
}

export async function openCarsModal(onCarsUpdated) {
  const modal = document.getElementById('fleet-cars-dialog');
  if (!modal) return;

  await refreshCarsList(modal, onCarsUpdated);
  modal.showModal();
}

async function refreshCarsList(modal, onCarsUpdated) {
  const container = modal.querySelector('#dynamic-cars-container');
  if (!container) return;

  try {
    const cars = await api.getCars();
    if (!cars || cars.length === 0) {
      container.innerHTML = '<p class="text-muted text-sm">No cars found.</p>';
      return;
    }

    container.innerHTML = cars.map(c => `
      <div class="car-dynamic-item">
        <div class="car-info-col">
          <div class="car-title-badge">
            <strong>${c.name}</strong>
            <span class="car-plate-code">${c.plate}</span>
          </div>
          <small class="car-sub-detail">${c.model || ''} • ${c.color || 'White'}</small>
        </div>
        <button type="button" class="btn-delete-car" data-car-id="${c._id || c.id}" title="Remove car">
          ✕
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-delete-car').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.carId;
        if (confirm('Remove this vehicle from the fleet?')) {
          try {
            await api.deleteCar(id);
            showToast('Vehicle removed');
            await refreshCarsList(modal, onCarsUpdated);
            if (onCarsUpdated) onCarsUpdated();
          } catch (err) {
            showToast(err.message || 'Failed to delete car', 'error');
          }
        }
      });
    });
  } catch (err) {
    container.innerHTML = '<p class="text-muted">Error loading cars.</p>';
  }
}
