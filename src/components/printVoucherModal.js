// Printable PDF Voucher Component - Official Take Me Home Trip Receipt & Audit
import { formatCurrency, icons } from '../utils/helpers.js';

let currentTripForPrint = null;

export function setupPrintVoucherModal() {
  let modal = document.getElementById('print-pdf-dialog');
  if (!modal) {
    const container = document.getElementById('modal-container');
    if (!container) return;
    
    const wrapper = document.createElement('div');
    wrapper.id = 'print-voucher-wrapper';
    wrapper.innerHTML = `
      <dialog id="print-pdf-dialog" class="print-dialog-container">
        <div class="print-dialog-card">
          <div class="print-dialog-header no-print">
            <span class="dialog-badge">🖨️ Trip Voucher PDF</span>
            <button type="button" class="btn-close-print" id="btn-close-pdf-modal">✕</button>
          </div>

          <div id="print-voucher-content" class="printable-sheet"></div>

          <div class="print-dialog-actions no-print">
            <button type="button" class="btn btn-secondary" id="btn-cancel-print">Close</button>
            <button type="button" class="btn btn-gold btn-glow" id="btn-trigger-print">
              ${icons.receipt}
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </dialog>
    `;
    container.appendChild(wrapper);
    modal = document.getElementById('print-pdf-dialog');
  }

  // Bind close and print events
  modal.querySelector('#btn-close-pdf-modal')?.addEventListener('click', () => modal.close());
  modal.querySelector('#btn-cancel-print')?.addEventListener('click', () => modal.close());
  modal.querySelector('#btn-trigger-print')?.addEventListener('click', () => {
    executeVoucherPrint();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

function executeVoucherPrint() {
  const content = document.getElementById('print-voucher-content');
  const voucherHtml = content?.innerHTML || '';
  const clientName = currentTripForPrint?.clientName || 'Client';

  try {
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Trip Voucher - ${clientName}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 25px; color: #0f172a; }
              .official-voucher-paper { width: 100%; max-width: 720px; margin: 0 auto; }
              .voucher-top-bar { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
              .voucher-company { font-size: 18px; font-weight: 800; margin: 0; }
              .voucher-sub { font-size: 11px; color: #475569; margin: 3px 0 0; }
              .voucher-reference { text-align: right; }
              .voucher-badge { font-size: 10px; font-weight: bold; color: #0284c7; }
              .voucher-id { font-size: 15px; font-weight: bold; font-family: monospace; }
              .voucher-date { font-size: 11px; color: #64748b; }
              .voucher-type-banner { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 14px; margin-bottom: 14px; border-radius: 4px; display: flex; align-items: center; gap: 10px; }
              .banner-chauffeur { background: #e0f2fe; border-left-color: #0284c7; }
              .type-icon { font-size: 20px; }
              .type-title { font-size: 13px; font-weight: bold; margin: 0; }
              .type-description { font-size: 11px; color: #475569; }
              .voucher-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
              .voucher-col-box, .voucher-route-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 12px; border-radius: 4px; }
              .col-heading { font-size: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; letter-spacing: 0.05em; }
              .info-line { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
              .route-line-item { margin-bottom: 8px; font-size: 12px; }
              .label-mini { font-size: 9px; color: #64748b; font-weight: bold; display: block; }
              .address-str { font-weight: 600; margin: 2px 0 0; }
              .voucher-who-section { margin-bottom: 14px; }
              .who-print-dual { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
              .who-print-card { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 4px; }
              .role-tag { font-size: 10px; font-weight: bold; color: #475569; }
              .driver-name-lg { font-size: 13px; font-weight: bold; display: block; }
              .duty-desc { font-size: 11px; color: #64748b; }
              .voucher-notes-box { background: #fefce8; border: 1px solid #fde047; padding: 10px 12px; border-radius: 4px; margin-bottom: 14px; }
              .notes-content { font-size: 12px; color: #713f12; margin: 4px 0 0; line-height: 1.4; }
              .voucher-fare-summary { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 12px; border-radius: 4px; margin-bottom: 14px; }
              .fare-total-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: bold; }
              .fare-highlight { color: #059669; font-size: 18px; }
              .voucher-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 18px; }
              .sig-space { border-bottom: 1px solid #94a3b8; height: 32px; margin-bottom: 4px; }
              .sig-title { font-size: 10px; font-weight: bold; }
              .sig-sub { font-size: 10px; color: #64748b; }
              .voucher-popia-footer { margin-top: 14px; padding: 8px 12px; background: #f1f5f9; border: 1px dashed #cbd5e1; font-size: 10px; color: #475569; line-height: 1.4; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="printable-sheet">
              ${voucherHtml}
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            <\/script>
          </body>
        </html>
      `);
      printWin.document.close();
    } else {
      window.print();
    }
  } catch (err) {
    console.warn('Fallback to standard window.print()', err);
    window.print();
  }
}

export function openPrintVoucher(trip) {
  currentTripForPrint = trip;
  let dialog = document.getElementById('print-pdf-dialog');
  if (!dialog) {
    setupPrintVoucherModal();
    dialog = document.getElementById('print-pdf-dialog');
  }
  const content = document.getElementById('print-voucher-content');
  if (!dialog || !content) return;

  const isTakeMeHome = trip.type === 'take_me_home';

  content.innerHTML = `
    <div class="official-voucher-paper">
      
      <!-- TOP HEADER -->
      <div class="voucher-top-bar">
        <div class="voucher-branding">
          <h1 class="voucher-company">TAKE ME HOME CHAUFFEUR FLEET</h1>
          <p class="voucher-sub">Three Brothers Chauffeur Operations • Gauteng, South Africa</p>
        </div>
        <div class="voucher-reference">
          <span class="voucher-badge">OFFICIAL TRIP VOUCHER</span>
          <div class="voucher-id">${trip._id || trip.id}</div>
          <div class="voucher-date">${trip.date} • ${trip.time}</div>
        </div>
      </div>

      <!-- TRIP TYPE BANNER -->
      <div class="voucher-type-banner ${isTakeMeHome ? 'banner-tmh' : 'banner-chauffeur'}">
        <span class="type-icon">${isTakeMeHome ? '🚗' : '🎩'}</span>
        <div>
          <h2 class="type-title">
            ${isTakeMeHome 
              ? 'TAKE ME HOME SERVICE (Client Car Escort • 2 Drivers Dispatched)' 
              : 'EXECUTIVE CHAUFFEUR SERVICE (1 Driver Dispatched)'}
          </h2>
          <span class="type-description">
            ${isTakeMeHome 
              ? 'Lead driver operates client vehicle while chase car follows for return escort.' 
              : 'Direct passenger transfer using our commercial fleet vehicle.'}
          </span>
        </div>
      </div>

      <!-- CLIENT & VEHICLE DETAILS -->
      <div class="voucher-two-col">
        <div class="voucher-col-box">
          <h3 class="col-heading">CLIENT & PASSENGER</h3>
          <div class="info-line"><span>Client Name:</span> <strong>${trip.clientName}</strong></div>
          <div class="info-line"><span>Phone:</span> <strong>${trip.clientPhone || 'N/A'}</strong></div>
          ${isTakeMeHome && trip.clientCar ? `
            <div class="info-line"><span>Client Vehicle Driven:</span> <strong>${trip.clientCar}</strong></div>
          ` : ''}
        </div>

        <div class="voucher-col-box">
          <h3 class="col-heading">TRIP METRICS</h3>
          <div class="info-line"><span>Status:</span> <strong class="capitalize">${trip.status === 'completed' ? 'Completed & Verified' : 'In Progress'}</strong></div>
          <div class="info-line"><span>Service Date:</span> <strong>${trip.date}</strong></div>
          <div class="info-line"><span>Dispatch Time:</span> <strong>${trip.time}</strong></div>
        </div>
      </div>

      <!-- ROUTE -->
      <div class="voucher-route-card">
        <h3 class="col-heading">TRANSIT ROUTE</h3>
        <div class="route-line-item">
          <span class="badge-dot pickup-dot"></span>
          <div>
            <span class="label-mini">PICKUP ADDRESS</span>
            <p class="address-str">${trip.pickup}</p>
          </div>
        </div>
        <div class="route-connector-line"></div>
        <div class="route-line-item">
          <span class="badge-dot dropoff-dot"></span>
          <div>
            <span class="label-mini">DROPOFF DESTINATION</span>
            <p class="address-str">${trip.dropoff}</p>
          </div>
        </div>
      </div>

      <!-- WHO DONE IT (CHAUFFEURS ASSIGNED) -->
      <div class="voucher-who-section">
        <h3 class="col-heading">CHAUFFEUR TEAM ASSIGNED (WHO DONE THIS TRIP):</h3>
        
        ${isTakeMeHome ? `
          <div class="who-print-dual">
            <div class="who-print-card">
              <span class="role-tag">DRIVER 1 (LEAD)</span>
              <strong class="driver-name-lg">${trip.clientDriverName || 'Lead Driver'}</strong>
              <span class="duty-desc">Drove client in client's car</span>
            </div>

            <div class="who-print-card">
              <span class="role-tag">DRIVER 2 (CHASE)</span>
              <strong class="driver-name-lg">${trip.chaseDriverName || 'Chase Driver'}</strong>
              <span class="duty-desc">Drove chase car: ${trip.chaseCar || 'Fleet Escort'}</span>
            </div>
          </div>
        ` : `
          <div class="who-print-solo">
            <div class="who-print-card">
              <span class="role-tag">CHAUFFEUR DRIVER</span>
              <strong class="driver-name-lg">${trip.driverName || 'Driver'}</strong>
              <span class="duty-desc">Fleet Car: ${trip.car || 'Fleet Vehicle'}</span>
            </div>
          </div>
        `}
      </div>

      <!-- PROMINENT TRIP NOTES (USER REQUIREMENT) -->
      <div class="voucher-notes-box">
        <h3 class="col-heading">📝 TRIP NOTES & INSTRUCTIONS:</h3>
        <p class="notes-content">
          ${trip.notes && trip.notes.trim() ? trip.notes : 'No specific trip notes recorded for this dispatch.'}
        </p>
      </div>

      <!-- FINANCIAL SUMMARY -->
      <div class="voucher-fare-summary">
        <div class="fare-total-row">
          <span>Total Fare Rate:</span>
          <span class="fare-highlight">${formatCurrency(trip.fare)}</span>
        </div>
      </div>

      <!-- SIGNATURE CONFIRMATION -->
      <div class="voucher-signatures">
        <div class="sig-column">
          <div class="sig-space"></div>
          <span class="sig-title">Client Signature / Confirmation</span>
          <span class="sig-sub">${trip.clientName}</span>
        </div>

        <div class="sig-column">
          <div class="sig-space"></div>
          <span class="sig-title">Lead Chauffeur Signature</span>
          <span class="sig-sub">${isTakeMeHome ? (trip.clientDriverName || 'Chauffeur') : (trip.driverName || 'Chauffeur')}</span>
        </div>
      </div>

      <!-- POPIA COMPLIANCE ENDORSEMENT (ACT 4 OF 2013) -->
      <div class="voucher-popia-footer">
        <span class="popia-lock-icon">🔒</span>
        <span>
          <strong>POPIA Act No. 4 of 2013 Endorsement:</strong> Personal information contained in this dispatch voucher is collected and processed strictly for transit fulfillment, vehicle audit, and insurance claim adjudication under lawful processing conditions. Confidentiality guaranteed.
        </span>
      </div>

    </div>
  `;

  dialog.showModal();
}
