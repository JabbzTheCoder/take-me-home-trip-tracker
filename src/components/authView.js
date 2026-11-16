// Authentication View - Secure JWT Login & Registration for Jabbz, Tebza, Fresh
import { api } from '../data/api.js';
import { showToast } from '../utils/helpers.js';

let authMode = 'login'; // 'login' | 'register'
let isSubmitting = false;

export function renderAuth() {
  return `
    <div class="auth-screen animate-fade-in">
      <div class="auth-card">
        
        <!-- Header -->
        <div class="auth-header">
          <div class="auth-icon-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
              <path d="M5 17h10"/>
            </svg>
          </div>
          <h1 class="auth-title">Take Me Home</h1>
          <p class="auth-sub">Jabbz • Tebza • Fresh • Fleet Ops</p>
        </div>

        <!-- Mode Switcher Tabs -->
        <div class="auth-mode-tabs">
          <button type="button" class="auth-tab ${authMode === 'login' ? 'active' : ''}" data-mode="login">
            Sign In
          </button>
          <button type="button" class="auth-tab ${authMode === 'register' ? 'active' : ''}" data-mode="register">
            Register Driver
          </button>
        </div>

        ${authMode === 'login' ? `
          <!-- LOGIN FORM -->
          <form id="form-login" class="auth-form">
            <div class="form-field">
              <label class="form-lbl" for="inp-login-email">Email Address *</label>
              <input 
                type="email" 
                id="inp-login-email" 
                class="modal-inp" 
                placeholder="e.g. jabbz@tmh-fleet.co.za" 
                required 
                autocomplete="email"
              />
            </div>

            <div class="form-field">
              <div class="password-label-row">
                <label class="form-lbl" for="inp-login-pass">Password *</label>
                <button type="button" class="btn-toggle-pass" id="btn-toggle-login-pass">Show</button>
              </div>
              <input 
                type="password" 
                id="inp-login-pass" 
                class="modal-inp" 
                placeholder="Enter your password" 
                required 
                autocomplete="current-password"
              />
            </div>

            <button type="submit" class="btn btn-gold btn-full btn-glow mt-2" ${isSubmitting ? 'disabled' : ''}>
              ${isSubmitting ? 'Verifying Credentials...' : 'Sign In'}
            </button>

           
          </form>
        ` : `
          <!-- REGISTRATION FORM -->
          <form id="form-register" class="auth-form">
            <div class="form-field">
              <label class="form-lbl" for="inp-reg-name">Driver Name *</label>
              <input type="text" id="inp-reg-name" class="modal-inp" placeholder="e.g. Neo" required />
            </div>

            <div class="form-field">
              <label class="form-lbl" for="inp-reg-email">Email Address *</label>
              <input type="email" id="inp-reg-email" class="modal-inp" placeholder="e.g. neo@tmh-fleet.co.za" required />
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label class="form-lbl" for="inp-reg-phone">Phone Number</label>
                <input type="tel" id="inp-reg-phone" class="modal-inp" placeholder="082 123 4567" />
              </div>

              <div class="form-field">
                <label class="form-lbl" for="inp-reg-role">System Powers</label>
                <input type="text" id="inp-reg-role" class="modal-inp" value="Admin Chauffeur" readonly />
              </div>
            </div>

            <div class="form-field">
              <label class="form-lbl" for="inp-reg-pass">Create Secure Password (min 6 characters) *</label>
              <input 
                type="password" 
                id="inp-reg-pass" 
                class="modal-inp" 
                placeholder="Choose a strong password" 
                minlength="6" 
                required 
                autocomplete="new-password"
              />
              <span class="field-hint">Encrypted with bcrypt (10 rounds). All users receive full admin powers.</span>
            </div>

            <button type="submit" class="btn btn-gold btn-full btn-glow mt-2" ${isSubmitting ? 'disabled' : ''}>
              ${isSubmitting ? 'Creating Account...' : 'Register Driver Account'}
            </button>
          </form>
        `}

      </div>
    </div>
  `;
}

export function bindAuthEvents(container, onSuccess) {
  container.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      authMode = e.currentTarget.dataset.mode;
      container.innerHTML = renderAuth();
      bindAuthEvents(container, onSuccess);
    });
  });

  const togglePassBtn = container.querySelector('#btn-toggle-login-pass');
  const passInp = container.querySelector('#inp-login-pass');
  if (togglePassBtn && passInp) {
    togglePassBtn.addEventListener('click', () => {
      if (passInp.type === 'password') {
        passInp.type = 'text';
        togglePassBtn.textContent = 'Hide';
      } else {
        passInp.type = 'password';
        togglePassBtn.textContent = 'Show';
      }
    });
  }

  container.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const email = e.currentTarget.dataset.email;
      const pass = e.currentTarget.dataset.pass;
      const emailInp = container.querySelector('#inp-login-email');
      const passInp = container.querySelector('#inp-login-pass');
      if (emailInp) emailInp.value = email;
      if (passInp) passInp.value = pass;
    });
  });

  const loginForm = container.querySelector('#form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = container.querySelector('#inp-login-email')?.value;
      const password = container.querySelector('#inp-login-pass')?.value;

      try {
        isSubmitting = true;
        container.innerHTML = renderAuth();
        bindAuthEvents(container, onSuccess);

        const res = await api.login(email, password);
        showToast(`Welcome back, ${res.user.name}!`);
        if (onSuccess) onSuccess(res.user, res.mustChangePassword);
      } catch (err) {
        isSubmitting = false;
        showToast(err.message || 'Login failed', 'error');
        container.innerHTML = renderAuth();
        bindAuthEvents(container, onSuccess);
      }
    });
  }

  const registerForm = container.querySelector('#form-register');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-reg-name')?.value;
      const email = container.querySelector('#inp-reg-email')?.value;
      const phone = container.querySelector('#inp-reg-phone')?.value;
      const role = container.querySelector('#inp-reg-role')?.value;
      const password = container.querySelector('#inp-reg-pass')?.value;

      try {
        isSubmitting = true;
        container.innerHTML = renderAuth();
        bindAuthEvents(container, onSuccess);

        const res = await api.register({ name, email, phone, role, password });
        showToast(`Account registered for ${res.user.name}!`);
        if (onSuccess) onSuccess(res.user, false);
      } catch (err) {
        isSubmitting = false;
        showToast(err.message || 'Registration failed', 'error');
        container.innerHTML = renderAuth();
        bindAuthEvents(container, onSuccess);
      }
    });
  }
}
