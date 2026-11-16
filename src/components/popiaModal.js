// POPIA Compliance Modal - South African Protection of Personal Information Act (Act 4 of 2013)
import { icons } from '../utils/helpers.js';

export function setupPopiaModal() {
  let modal = document.getElementById('popia-dialog');
  if (!modal) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <dialog id="popia-dialog" class="simple-mobile-dialog">
        <div class="modal-card">
          <div class="modal-top-bar">
            <div>
              <h2 class="modal-heading">POPIA Compliance Statement</h2>
              <small class="text-gold">Protection of Personal Information Act (Act 4 of 2013)</small>
            </div>
            <button type="button" class="modal-close" id="btn-close-popia">✕</button>
          </div>

          <div class="popia-compliance-content">
            
            <div class="popia-status-badge">
              <span class="status-icon">🛡️</span>
              <div>
                <strong>POPIA Status: Compliant & Verified</strong>
                <p>Designed for South African Insurance Take Me Home & Chauffeur Services</p>
              </div>
            </div>

            <!-- The 8 Conditions of Lawful Processing -->
            <div class="popia-section">
              <h3 class="popia-section-title">The 8 POPIA Conditions for Lawful Processing:</h3>
              
              <div class="popia-condition-card">
                <span class="cond-num">1</span>
                <div>
                  <strong>Accountability</strong>
                  <p>All drivers (Jabbz, Tebza, Fresh) are authenticated with individual JWT tokens and private bcrypt-hashed passwords. Each dispatch logs an immutable audit trail.</p>
                </div>
              </div>

              <div class="popia-condition-card">
                <span class="cond-num">2</span>
                <div>
                  <strong>Processing Limitation & Lawful Consent</strong>
                  <p>Passenger name, phone number, vehicle type, and addresses are collected solely with consent for executing the insurance claim and dispatching safe transit.</p>
                </div>
              </div>

              <div class="popia-condition-card">
                <span class="cond-num">3</span>
                <div>
                  <strong>Purpose Specification</strong>
                  <p>Personal data is collected strictly for route dispatch, driver safety, vehicle return escort, and invoicing/claims validation.</p>
                </div>
              </div>

              <div class="popia-condition-card">
                <span class="cond-num">4</span>
                <div>
                  <strong>Further Processing Limitation</strong>
                  <p>Client contact details and residential dropoff addresses are never sold, shared with third parties, or used for unsolicited marketing.</p>
                </div>
              </div>

              <div class="popia-condition-card">
                <span class="cond-num">5</span>
                <div>
                  <strong>Information Quality</strong>
                  <p>Data is recorded directly at dispatch and can be updated or corrected immediately by authenticated admin drivers.</p>
                </div>
              </div>

              <div class="popia-condition-card">
                <span class="cond-num">6</span>
                <div>
                  <strong>Openness & Transparency</strong>
                  <p>Clients are informed of data capture via printed/digital trip vouchers and dispatch confirmation receipts.</p>
                </div>
              </div>

              <div class="popia-condition-card">
                <span class="cond-num">7</span>
                <div>
                  <strong>Security Safeguards (Technical Measures)</strong>
                  <p>Data is stored in protected MongoDB instances. Authentication is secured by JWT bearer tokens and 10 rounds of bcrypt password hashing. Ephemeral secrets like gate codes can be purged upon trip completion.</p>
                </div>
              </div>

              <div class="popia-condition-card">
                <span class="cond-num">8</span>
                <div>
                  <strong>Data Subject Rights (Access & Erasure)</strong>
                  <p>In accordance with Sections 23 & 24 of POPIA, clients have the right to request access to their transit records or request total deletion (Right to Erasure) using the admin delete controls.</p>
                </div>
              </div>
            </div>

            <!-- Designated Information Officer -->
            <div class="popia-officer-box">
              <span class="box-title">DESIGNATED INFORMATION CONTACT:</span>
              <p>Fleet Operations Team: <strong>Jabbz, Tebza & Fresh</strong></p>
              <p>Email: <code>ops@tmh-fleet.co.za</code> • Location: Gauteng, South Africa</p>
            </div>

          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-gold btn-full" id="btn-done-popia">Understood & Verified</button>
          </div>
        </div>
      </dialog>
    `;
    container.appendChild(wrapper.firstElementChild);
    modal = document.getElementById('popia-dialog');
  }

  modal.querySelector('#btn-close-popia')?.addEventListener('click', () => modal.close());
  modal.querySelector('#btn-done-popia')?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

export function openPopiaModal() {
  const modal = document.getElementById('popia-dialog');
  if (modal) modal.showModal();
}
