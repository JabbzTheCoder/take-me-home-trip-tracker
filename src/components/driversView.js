// Drivers & Brotherhood Hub View - 3 Brothers Equity, Rotation Balance, and Payout Settlement
import { store } from '../data/store.js';
import { formatCurrency, formatNumber, icons } from '../utils/helpers.js';

export function renderDrivers() {
  const data = store.data;
  const analysis = store.getFairnessAnalysis();
  const car1 = data.cars.find(c => c.id === 'car-1');
  const car2 = data.cars.find(c => c.id === 'car-2');

  return `
    <div class="drivers-container animate-fade-in">
      
      <!-- HEADER -->
      <div class="page-top-header">
        <div>
          <h1 class="page-title">Three Brothers Operations & Payouts</h1>
          <p class="page-subtitle">Track trip distribution, ensure 100% fair equality across the brothers, and settle shared profit dividends</p>
        </div>

        <div class="header-action-group">
          <button class="btn btn-secondary" id="btn-print-payouts">
            ${icons.receipt}
            <span>Print Payout Sheet</span>
          </button>
        </div>
      </div>

      <!-- BROTHERHOOD ROTATION & EQUITY SUMMARY -->
      <div class="equity-banner-card">
        <div class="equity-banner-header">
          <div class="equity-badge">
            ${icons.scale}
            <span>FAIR EQUALIZER ALGORITHM</span>
          </div>
          <span class="equity-tag">Target: 33.3% Equal Rotation Per Brother</span>
        </div>

        <div class="equity-split-preview">
          <div class="equity-stat-block">
            <span class="stat-lbl">Total Fleet Revenue</span>
            <span class="stat-num">${formatCurrency(analysis.totalRevenue)}</span>
          </div>
          <div class="equity-divider"></div>
          <div class="equity-stat-block">
            <span class="stat-lbl">Shared Brother Pot (30%)</span>
            <span class="stat-num text-emerald">${formatCurrency(analysis.totalBrotherPot)}</span>
            <span class="stat-sub">(${formatCurrency(analysis.sharedPotPerBrother)} per brother)</span>
          </div>
          <div class="equity-divider"></div>
          <div class="equity-stat-block">
            <span class="stat-lbl">Vehicle Fuel Reserve (20%)</span>
            <span class="stat-num text-cyan">${formatCurrency(analysis.totalFuelFund)}</span>
          </div>
          <div class="equity-divider"></div>
          <div class="equity-stat-block">
            <span class="stat-lbl">Next Priority Dispatch</span>
            <span class="stat-num text-gold"><strong>${analysis.recommendedNextDriver?.name.split(' ')[0]}</strong></span>
            <span class="stat-sub">Has lowest trip volume</span>
          </div>
        </div>

        <!-- Visual Bar Comparison -->
        <div class="fairness-stacked-bar">
          ${analysis.driverStats.map(d => `
            <div 
              class="stacked-segment" 
              style="width: ${d.tripSharePercent}%; background: ${d.avatarColor};"
              title="${d.name}: ${d.tripSharePercent}% (${d.totalTrips} trips)"
            >
              <span>${d.name.split(' ')[0]} ${d.tripSharePercent}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- THE 3 BROTHERS CARDS -->
      <div class="brothers-cards-grid">
        ${analysis.driverStats.map(driver => {
          const assignedCar = data.cars.find(c => c.id === driver.assignedCarId);
          const isNext = driver.id === analysis.recommendedNextDriver?.id;

          return `
            <div class="brother-card ${isNext ? 'card-glow-gold' : ''}">
              <div class="brother-card-top">
                <div class="brother-avatar-large" style="background: ${driver.avatarColor}">
                  ${driver.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div class="brother-title-area">
                  <div class="brother-name-row">
                    <h2 class="brother-full-name">${driver.name}</h2>
                    ${isNext ? '<span class="pill-next-turn">Next Up 🎯</span>' : ''}
                  </div>
                  <div class="brother-role">${driver.role}</div>
                  <div class="brother-contact">📞 ${driver.phone}</div>
                </div>
              </div>

              <!-- STATUS & CAR CHIP -->
              <div class="brother-status-bar">
                <div class="status-indicator">
                  <span class="status-chip chip-${driver.status}">
                    ${driver.status === 'driving' ? '🚗 On Duty' : driver.status === 'standby' ? '☕ Standby / Relief' : '🛌 Off-Duty'}
                  </span>
                </div>
                <div class="assigned-car-chip">
                  ${assignedCar ? `
                    <span class="car-tag">🔑 ${assignedCar.plate} (${assignedCar.name.split('-')[0]})</span>
                  ` : `
                    <span class="car-tag text-muted">No Car Assigned</span>
                  `}
                </div>
              </div>

              <!-- STATS GRID -->
              <div class="brother-stats-grid">
                <div class="b-stat">
                  <span class="b-label">Trips Driven</span>
                  <span class="b-val">${driver.totalTrips}</span>
                  <span class="b-sub">${driver.completedTrips} completed</span>
                </div>

                <div class="b-stat">
                  <span class="b-label">Distance Run</span>
                  <span class="b-val">${formatNumber(driver.totalKm)} km</span>
                  <span class="b-sub">Behind the wheel</span>
                </div>

                <div class="b-stat">
                  <span class="b-label">Service Rating</span>
                  <span class="b-val text-gold">★ ${driver.rating}</span>
                  <span class="b-sub">Client feedback</span>
                </div>

                <div class="b-stat">
                  <span class="b-label">Fair Share</span>
                  <span class="b-val">${driver.tripSharePercent}%</span>
                  <span class="b-sub">Goal: 33.3%</span>
                </div>
              </div>

              <!-- PAYOUT & EARNINGS BREAKDOWN -->
              <div class="brother-payout-box">
                <div class="payout-row">
                  <span>Direct Driver Commission (50%):</span>
                  <strong>${formatCurrency(driver.directEarnings)}</strong>
                </div>
                <div class="payout-row">
                  <span>Brother Pot Dividend (1/3 Share):</span>
                  <strong class="text-gold">+ ${formatCurrency(driver.potDividend)}</strong>
                </div>
                <div class="payout-total-row">
                  <span>Total Net Payout:</span>
                  <span class="total-take-home">${formatCurrency(driver.totalTakeHome)}</span>
                </div>
                <div class="bank-account-sub">
                  <span>🏦 ${driver.payoutBank}</span>
                </div>
              </div>

              <!-- ACTIONS -->
              <div class="brother-card-footer">
                <button class="btn btn-outline btn-sm btn-edit-driver" data-driver-id="${driver.id}">
                  ${icons.settings}
                  <span>Edit Profile</span>
                </button>
                <button class="btn btn-secondary btn-sm btn-toggle-status" data-driver-id="${driver.id}" data-current-status="${driver.status}">
                  Change Status
                </button>
              </div>

            </div>
          `;
        }).join('')}
      </div>

      <!-- PAYOUT SETTLEMENT TABLE & INVOICING -->
      <section class="dash-card mt-6">
        <div class="dash-card-header">
          <div>
            <h2 class="dash-card-title">Brotherhood Distribution Settlement Sheet</h2>
            <p class="dash-card-subtitle">Transparent brotherly payout distribution ready for bank EFT payments</p>
          </div>
          <span class="badge-tag">Current Cycle</span>
        </div>

        <div class="trips-table-wrapper">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Brother</th>
                <th>Role & Bank</th>
                <th>Trips Driven</th>
                <th>Total KM</th>
                <th>Direct Commission</th>
                <th>Pot Dividend (33.3%)</th>
                <th>Total Take-Home Pay</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${analysis.driverStats.map(d => `
                <tr>
                  <td>
                    <div class="cell-driver">
                      <span class="dot-driver" style="background: ${d.avatarColor}"></span>
                      <strong>${d.name}</strong>
                    </div>
                  </td>
                  <td>
                    <div class="cell-sub">${d.role}</div>
                    <div class="cell-sub text-muted">${d.payoutBank}</div>
                  </td>
                  <td><strong>${d.totalTrips}</strong> (${d.tripSharePercent}%)</td>
                  <td>${formatNumber(d.totalKm)} km</td>
                  <td class="text-emerald"><strong>${formatCurrency(d.directEarnings)}</strong></td>
                  <td class="text-gold"><strong>${formatCurrency(d.potDividend)}</strong></td>
                  <td>
                    <span class="payout-highlight">${formatCurrency(d.totalTakeHome)}</span>
                  </td>
                  <td>
                    <span class="status-pill status-completed">Ready for EFT</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="table-total-row">
                <td colspan="4"><strong>TOTAL BROTHER PAYOUTS + FLEET RESERVE</strong></td>
                <td><strong>${formatCurrency(analysis.driverStats.reduce((a, b) => a + b.directEarnings, 0))}</strong></td>
                <td><strong>${formatCurrency(analysis.totalBrotherPot)}</strong></td>
                <td><strong>${formatCurrency(analysis.totalRevenue - analysis.totalFuelFund)}</strong></td>
                <td><span class="badge-sm">Balanced</span></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

    </div>
  `;
}
