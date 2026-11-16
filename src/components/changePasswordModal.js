// Mandatory Password Change Component - Security requirement for first-time login
import { api } from '../data/api.js';
import { showToast, icons } from '../utils/helpers.js';

export function renderChangePasswordScreen(user, onSuccess) {
  const container = document.getElementById('view-content');
  if (!container) return;

  container.innerHTML = `
    <div class="auth-screen animate-fade-in">
      <div class="auth-card">
        
        <div class="auth-header">
          <div class="auth-icon-badge icon-badge-gold">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 class="auth-title">Mandatory Security Step</h1>
          <p class="auth-sub">Set your own private password</p>
        </div>

        <div class="security-alert-box">
          <p>
            Welcome, <strong>${user.name}</strong>! To ensure the other drivers cannot access your account or log in as you, you must choose your own private password now.
          </p>
        </div>

        <form id="form-change-password" class="auth-form">
          <div class="form-field">
            <label class="form-lbl" for="inp-new-password">New Private Password (min 6 characters) *</label>
            <input 
              type="password" 
              id="inp-new-password" 
              class="modal-inp" 
              placeholder="Enter your new secret password" 
              minlength="6" 
              required 
              autocomplete="new-password"
            />
          </div>

          <div class="form-field">
            <label class="form-lbl" for="inp-confirm-password">Confirm New Password *</label>
            <input 
              type="password" 
              id="inp-confirm-password" 
              class="modal-inp" 
              placeholder="Confirm your new secret password" 
              minlength="6" 
              required 
              autocomplete="new-password"
            />
          </div>

          <button type="submit" class="btn btn-gold btn-full btn-glow mt-2" id="btn-submit-change-pass">
            ${icons.check}
            <span>Set My Private Password & Enter</span>
          </button>
        </form>

        <div class="auth-security-note">
          <span class="sec-icon">🔒</span>
          <span>Your new password will be encrypted with bcrypt (10 rounds) in MongoDB. Only you will know this password.</span>
        </div>

      </div>
    </div>
  `;

  const form = container.querySelector('#form-change-password');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = container.querySelector('#inp-new-password')?.value;
    const confirmPassword = container.querySelector('#inp-confirm-password')?.value;

    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match. Please re-enter', 'error');
      return;
    }

    const btn = container.querySelector('#btn-submit-change-pass');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Updating Password in MongoDB...';
    }

    try {
      await api.changePassword(newPassword, confirmPassword);
      showToast('Password updated! Your account is now private.');
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Set My Private Password & Enter';
      }
    }
  });
}
