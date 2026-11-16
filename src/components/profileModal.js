// User Profile Editor Component - Update Name, Email, Phone, Picture & Theme
import { api } from '../data/api.js';
import { showToast, icons } from '../utils/helpers.js';

const AVATAR_COLORS = [
  '#38bdf8', // Cyan
  '#f59e0b', // Gold / Amber
  '#10b981', // Emerald
  '#a855f7', // Purple
  '#f43f5e', // Rose
  '#06b6d4', // Teal
  '#6366f1'  // Indigo
];

export function setupProfileModal(onProfileUpdated) {
  let modal = document.getElementById('profile-dialog');
  if (!modal) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'profile-dialog-wrapper';
    wrapper.innerHTML = `
      <dialog id="profile-dialog" class="simple-mobile-dialog">
        <div class="modal-card">
          <div class="modal-top-bar">
            <div>
              <h2 class="modal-heading">Driver Profile</h2>
              <small class="text-gold">Admin Chauffeur Credentials</small>
            </div>
            <button type="button" class="modal-close" id="btn-close-profile">✕</button>
          </div>

          <form id="form-edit-profile" class="modal-form">
            <!-- Profile Avatar Preview & Upload -->
            <div class="profile-pic-section">
              <div class="profile-avatar-preview" id="profile-avatar-display">
                <!-- Preview image or initial -->
              </div>
              <div class="profile-pic-controls">
                <label class="btn btn-secondary btn-sm" for="inp-avatar-file">
                  <span>📸 Upload Photo</span>
                </label>
                <input type="file" id="inp-avatar-file" accept="image/*" style="display:none;" />
                <button type="button" class="btn-clear-photo" id="btn-remove-photo" style="display:none;">
                  Remove Photo
                </button>
                <small class="text-muted">Max 2MB (JPG, PNG, WebP)</small>
              </div>
            </div>

            <!-- Avatar Theme Color Selector -->
            <div class="form-field">
              <label class="form-lbl">Avatar Color Theme</label>
              <div class="color-palette-row" id="color-palette-container">
                ${AVATAR_COLORS.map(c => `
                  <button type="button" class="color-dot" data-color="${c}" style="background: ${c};" title="${c}"></button>
                `).join('')}
              </div>
            </div>

            <!-- Name -->
            <div class="form-field">
              <label class="form-lbl" for="inp-profile-name">Full Driver Name *</label>
              <input type="text" id="inp-profile-name" class="modal-inp" placeholder="e.g. Jabbz" required />
            </div>

            <!-- Email -->
            <div class="form-field">
              <label class="form-lbl" for="inp-profile-email">Email Address *</label>
              <input type="email" id="inp-profile-email" class="modal-inp" placeholder="e.g. jabbz@tmh-fleet.co.za" required />
            </div>

            <!-- Phone Number -->
            <div class="form-field">
              <label class="form-lbl" for="inp-profile-phone">Mobile Contact Number</label>
              <input type="tel" id="inp-profile-phone" class="modal-inp" placeholder="e.g. +27 82 450 1198" />
            </div>

            <!-- System Role / Admin Powers Notice -->
            <div class="admin-profile-callout">
              <span class="callout-shield">🛡️</span>
              <div>
                <strong>Full Admin Powers Enabled</strong>
                <p>Role: Admin Chauffeur • Unrestricted access to fleet cars, dispatches, audits, and POPIA controls.</p>
              </div>
            </div>

            <!-- Submit -->
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary btn-full" id="btn-cancel-profile">Cancel</button>
              <button type="submit" class="btn btn-gold btn-full btn-glow" id="btn-save-profile">
                ${icons.check}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>

        </div>
      </dialog>
    `;
    container.appendChild(wrapper);
    modal = document.getElementById('profile-dialog');
  }

  modal.querySelector('#btn-close-profile')?.addEventListener('click', () => modal.close());
  modal.querySelector('#btn-cancel-profile')?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

export function openProfileModal(onProfileUpdated) {
  setupProfileModal(onProfileUpdated);
  const modal = document.getElementById('profile-dialog');
  if (!modal) return;

  const user = api.getCurrentUser() || {};
  let selectedColor = user.avatarColor || '#38bdf8';
  let uploadedPicBase64 = user.profilePic || '';

  const nameInp = modal.querySelector('#inp-profile-name');
  const emailInp = modal.querySelector('#inp-profile-email');
  const phoneInp = modal.querySelector('#inp-profile-phone');
  const avatarDisplay = modal.querySelector('#profile-avatar-display');
  const fileInp = modal.querySelector('#inp-avatar-file');
  const removePhotoBtn = modal.querySelector('#btn-remove-photo');

  if (nameInp) nameInp.value = user.name || '';
  if (emailInp) emailInp.value = user.email || '';
  if (phoneInp) phoneInp.value = user.phone || '';

  function updateAvatarPreview() {
    if (uploadedPicBase64) {
      avatarDisplay.innerHTML = `<img src="${uploadedPicBase64}" alt="Profile" class="avatar-img-preview" />`;
      if (removePhotoBtn) removePhotoBtn.style.display = 'inline-block';
    } else {
      avatarDisplay.style.background = selectedColor;
      avatarDisplay.innerHTML = `<span class="avatar-letter-preview">${(user.name || 'D').charAt(0).toUpperCase()}</span>`;
      if (removePhotoBtn) removePhotoBtn.style.display = 'none';
    }
  }

  updateAvatarPreview();

  // Color picker
  modal.querySelectorAll('.color-dot').forEach(dot => {
    const color = dot.dataset.color;
    dot.classList.toggle('selected-color', color.toLowerCase() === selectedColor.toLowerCase());
    dot.onclick = () => {
      selectedColor = color;
      modal.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected-color'));
      dot.classList.add('selected-color');
      updateAvatarPreview();
    };
  });

  // File Upload
  fileInp.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      showToast('Image size exceeds 2.5MB. Please choose a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedPicBase64 = event.target.result;
      updateAvatarPreview();
      showToast('Photo loaded! Click Save to apply.');
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  if (removePhotoBtn) {
    removePhotoBtn.onclick = () => {
      uploadedPicBase64 = '';
      if (fileInp) fileInp.value = '';
      updateAvatarPreview();
    };
  }

  // Form submit
  const form = modal.querySelector('#form-edit-profile');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const saveBtn = modal.querySelector('#btn-save-profile');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving Profile...';
    }

    try {
      const payload = {
        name: nameInp?.value,
        email: emailInp?.value,
        phone: phoneInp?.value,
        avatarColor: selectedColor,
        profilePic: uploadedPicBase64
      };

      const res = await api.updateProfile(payload);
      showToast('Profile updated successfully!');
      modal.close();
      if (onProfileUpdated) onProfileUpdated(res.user);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Profile Changes';
      }
    }
  };

  modal.showModal();
}
