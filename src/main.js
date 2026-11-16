// Main Application Orchestrator - JWT Authentication, MongoDB Integration, PDF Printing, and Mandatory Password Change
import { api } from './data/api.js';
import { renderAuth, bindAuthEvents } from './components/authView.js';
import { renderDashboard, bindDashboardEvents } from './components/dashboardView.js';
import { setupTripModal } from './components/tripModal.js';
import { setupPrintVoucherModal } from './components/printVoucherModal.js';
import { setupCarsModal, openCarsModal } from './components/carsModal.js';
import { renderChangePasswordScreen } from './components/changePasswordModal.js';
import { setupPopiaModal, openPopiaModal } from './components/popiaModal.js';
import { setupProfileModal, openProfileModal } from './components/profileModal.js';
import { setupTripDetailModal } from './components/tripDetailView.js';

let tripsCache = [];

async function init() {
  setupPrintVoucherModal();
  setupPopiaModal();
  setupTripDetailModal();
  setupProfileModal(async () => {
    await loadAndRenderDashboard();
  });

  const token = api.getToken();
  if (!token) {
    showAuthScreen();
    return;
  }

  try {
    // Validate JWT token with backend
    const user = await api.getMe();
    
    // MANDATORY REQUIREMENT: Require users to change their password on first login
    if (user && user.mustChangePassword) {
      renderChangePasswordScreen(user, async () => {
        await loadAndRenderDashboard();
      });
      return;
    }

    await loadAndRenderDashboard();
  } catch (err) {
    console.warn('Session expired or invalid token:', err.message);
    api.logout();
    showAuthScreen();
  }
}

function showAuthScreen() {
  const container = document.getElementById('view-content');
  if (!container) return;

  container.innerHTML = renderAuth();
  bindAuthEvents(container, async () => {
    const user = api.getCurrentUser();
    // Check if mandatory password change is needed
    if (user && user.mustChangePassword) {
      renderChangePasswordScreen(user, async () => {
        await loadAndRenderDashboard();
      });
    } else {
      await loadAndRenderDashboard();
    }
  });
}

async function loadAndRenderDashboard() {
  const container = document.getElementById('view-content');
  if (!container) return;

  container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Connecting to MongoDB fleet database...</p>
    </div>
  `;

  try {
    // Initialize modals with dynamic data
    setupCarsModal(async () => {
      await setupTripModal();
    });

    await setupTripModal(async () => {
      await refreshTrips();
    });

    tripsCache = await api.getTrips();

    container.innerHTML = renderDashboard(tripsCache);
    bindDashboardEvents(
      container,
      async () => await refreshTrips(),
      () => showAuthScreen(),
      () => openCarsModal(async () => { await setupTripModal(); }),
      () => {
        const user = api.getCurrentUser();
        renderChangePasswordScreen(user, async () => {
          await loadAndRenderDashboard();
        });
      },
      () => openPopiaModal(),
      () => openProfileModal(async () => {
        await loadAndRenderDashboard();
      })
    );
  } catch (err) {
    console.error('Failed to load trips:', err);
    container.innerHTML = `
      <div class="mobile-empty-card">
        <p>Could not connect to backend server. Make sure server is running.</p>
        <button class="btn btn-gold btn-sm" id="btn-retry-load">Retry</button>
      </div>
    `;
    container.querySelector('#btn-retry-load')?.addEventListener('click', loadAndRenderDashboard);
  }
}

async function refreshTrips() {
  const container = document.getElementById('view-content');
  if (!container) return;

  try {
    tripsCache = await api.getTrips();
    container.innerHTML = renderDashboard(tripsCache);
    bindDashboardEvents(
      container,
      async () => await refreshTrips(),
      () => showAuthScreen(),
      () => openCarsModal(async () => { await setupTripModal(); }),
      () => {
        const user = api.getCurrentUser();
        renderChangePasswordScreen(user, async () => {
          await loadAndRenderDashboard();
        });
      },
      () => openPopiaModal(),
      () => openProfileModal(async () => {
        await loadAndRenderDashboard();
      })
    );
  } catch (err) {
    console.error('Error refreshing trips:', err);
  }
}

document.addEventListener('DOMContentLoaded', init);

