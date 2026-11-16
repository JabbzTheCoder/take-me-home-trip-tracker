// lib/voucher.js - Professional Printable PDF Voucher Generator
import { formatCurrency } from './helpers';

export function printTripVoucher(trip) {
  if (!trip) return;

  const printWin = window.open('', '_blank', 'width=800,height=950');
  if (!printWin) {
    window.print();
    return;
  }

  const isTakeMeHome = trip.type === 'take_me_home';
  const refCode = `TMH-${(trip._id || trip.id || '2026').toString().slice(-6).toUpperCase()}`;

  const voucherHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Trip_Voucher_${refCode}</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 28px;
          color: #0f172a;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .voucher-box {
          border: 2px solid #0f172a;
          border-radius: 12px;
          padding: 28px;
          max-width: 680px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 18px;
          margin-bottom: 20px;
        }
        .brand-title {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .brand-sub {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
          font-weight: 600;
        }
        .ref-badge {
          background: #0f172a;
          padding: 8px 14px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          font-weight: bold;
          color: #fbbf24;
          letter-spacing: 1px;
        }
        .type-banner {
          background: ${isTakeMeHome ? '#fef3c7' : '#e0f2fe'};
          border: 1px solid ${isTakeMeHome ? '#f59e0b' : '#38bdf8'};
          color: ${isTakeMeHome ? '#92400e' : '#0369a1'};
          padding: 10px 14px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 13px;
          text-transform: uppercase;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 20px;
        }
        .info-cell {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 14px;
          border-radius: 8px;
        }
        .info-cell label {
          display: block;
          font-size: 10px;
          color: #64748b;
          font-weight: bold;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .info-cell span {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .route-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 16px;
          margin-bottom: 20px;
        }
        .route-line {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .route-line:last-child { margin-bottom: 0; }
        .route-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }
        .dot-pickup { background: #f59e0b; }
        .dot-dropoff { background: #10b981; }
        .fare-card {
          background: #ecfdf5;
          border: 1px solid #10b981;
          padding: 16px 18px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .fare-lbl { font-size: 13px; font-weight: bold; color: #065f46; text-transform: uppercase; }
        .fare-amount { font-size: 24px; font-weight: 900; color: #065f46; font-family: monospace; }
        .notes-box {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 20px;
          font-size: 12px;
          color: #78350f;
          line-height: 1.5;
        }
        .footer-note {
          font-size: 10px;
          color: #94a3b8;
          text-align: center;
          border-top: 1px dashed #cbd5e1;
          padding-top: 14px;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="voucher-box">
        <div class="header-row">
          <div>
            <h1 class="brand-title">TAKE ME HOME FLEET</h1>
            <div class="brand-sub">Official Insurance Chauffeur Trip Voucher • POPIA Act 4 of 2013</div>
          </div>
          <div class="ref-badge">${refCode}</div>
        </div>

        <div class="type-banner">
          <span>${isTakeMeHome ? '🚗 Take Me Home (2 Drivers Dispatched)' : '🎩 Chauffeur Transit (1 Driver)'}</span>
          <span>${trip.date} • ${trip.time}</span>
        </div>

        <div class="section-title">Client & Booking Details</div>
        <div class="info-grid">
          <div class="info-cell">
            <label>CLIENT FULL NAME</label>
            <span>${trip.clientName}</span>
          </div>
          <div class="info-cell">
            <label>CLIENT CONTACT PHONE</label>
            <span>${trip.clientPhone || 'Confidential / On File'}</span>
          </div>
          ${isTakeMeHome && trip.clientCar ? `
            <div class="info-cell" style="grid-column: span 2;">
              <label>CLIENT DRIVEN VEHICLE</label>
              <span>${trip.clientCar}</span>
            </div>
          ` : ''}
        </div>

        <div class="section-title">Transit Route Flow</div>
        <div class="route-box">
          <div class="route-line">
            <span class="route-dot dot-pickup"></span>
            <strong>PICKUP:</strong> ${trip.pickup}
          </div>
          <div class="route-line">
            <span class="route-dot dot-dropoff"></span>
            <strong>DROPOFF:</strong> ${trip.dropoff}
          </div>
        </div>

        <div class="section-title">Driver Audit Verification</div>
        <div class="info-grid">
          ${isTakeMeHome ? `
            <div class="info-cell">
              <label>LEAD CHAUFFEUR (Client Car)</label>
              <span>👤 ${trip.clientDriverName || 'Lead Chauffeur'}</span>
            </div>
            <div class="info-cell">
              <label>ESCORT CHASE (Follow Vehicle)</label>
              <span>🚗 ${trip.chaseDriverName || 'Chase Driver'} (${trip.chaseCar || 'Fleet Escort'})</span>
            </div>
          ` : `
            <div class="info-cell" style="grid-column: span 2;">
              <label>ASSIGNED CHAUFFEUR & VEHICLE</label>
              <span>🎩 ${trip.driverName || 'Chauffeur'} — Fleet: ${trip.car || 'Company Fleet'}</span>
            </div>
          `}
        </div>

        ${trip.notes && trip.notes.trim() ? `
          <div class="section-title">Trip Notes & Instructions</div>
          <div class="notes-box">
            <strong>Notes:</strong> ${trip.notes}
          </div>
        ` : ''}

        <div class="fare-card">
          <span class="fare-lbl">Agreed Service Fare</span>
          <span class="fare-amount">${formatCurrency(trip.fare)}</span>
        </div>

        <div class="footer-note">
          Verified Take Me Home Chauffeur dispatch system • Drivers: Jabbz, Tebza, Fresh.<br />
          Personal information processed strictly in compliance with the Protection of Personal Information Act (POPIA Act 4 of 2013).
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWin.document.open();
  printWin.document.write(voucherHtml);
  printWin.document.close();
}
