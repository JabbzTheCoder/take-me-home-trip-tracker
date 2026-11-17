// lib/payouts.js - TMH Friday Payouts & Payroll Calculations
import { calculateTripSplits } from './splits.js';

/**
 * Checks if a status string represents a cancelled or paused trip.
 * Backwards compatible with legacy 'deferred' status.
 */
export function isTripCancelledOrPaused(status) {
  if (!status) return false;
  const s = String(status).toLowerCase().trim();
  return (
    s === 'deferred' ||
    s === 'cancelled' ||
    s === 'paused' ||
    s === 'cancelled_paused' ||
    s === 'paused_cancelled'
  );
}

/**
 * Returns user-facing status label.
 */
export function getTripStatusLabel(status) {
  return isTripCancelledOrPaused(status) ? 'Cancelled / Paused' : 'Completed';
}

/**
 * Calculates upcoming Friday payout date, countdown, and active 7-day payroll cycle window.
 * 
 * Payout rules:
 * - Weekly payouts happen every Friday.
 * - Weekly cycle ends on the upcoming Friday (covering trips done in the last 7 days / weekly cycle).
 * - If today is Friday, payout day is TODAY!
 */
export function getNextFridayInfo(refDate = new Date()) {
  const d = new Date(refDate);
  const day = d.getDay(); // 0: Sunday, 1: Monday, ..., 5: Friday, 6: Saturday
  const diff = (5 - day + 7) % 7; // days until upcoming Friday

  const nextFriday = new Date(d);
  nextFriday.setDate(d.getDate() + diff);
  nextFriday.setHours(23, 59, 59, 999);

  // Weekly cycle start: 6 days before Friday (Saturday 00:00:00)
  const cycleStart = new Date(nextFriday);
  cycleStart.setDate(nextFriday.getDate() - 6);
  cycleStart.setHours(0, 0, 0, 0);

  const options = { month: 'short', day: 'numeric' };
  const cycleLabel = `${cycleStart.toLocaleDateString('en-GB', options)} – ${nextFriday.toLocaleDateString('en-GB', options)}`;
  const fridayLabel = nextFriday.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const fullFridayDate = nextFriday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return {
    nextFriday,
    cycleStart,
    daysUntil: diff,
    isPayoutToday: diff === 0,
    cycleLabel,
    fridayLabel,
    fullFridayDate
  };
}

/**
 * Calculates Friday payout metrics for trips and currently logged in driver.
 * 
 * @param {Array} trips - Array of trip objects.
 * @param {Object} currentUser - Current logged-in user { name, role, ... }.
 * @returns {Object} Payout metrics.
 */
export function calculatePayoutStats(trips = [], currentUser = null) {
  const fridayInfo = getNextFridayInfo();
  const userName = (currentUser?.name || currentUser?.username || '').trim().toLowerCase();

  const cycleTrips = [];
  let cancelledPausedCount = 0;
  let allTimeCompletedCount = 0;
  let allTimeGross = 0;
  let allTimeNet = 0;
  let tmhCount = 0;
  let chauffeurCount = 0;

  trips.forEach(trip => {
    const isCancelled = isTripCancelledOrPaused(trip.status);
    const isDone = !isCancelled;

    if (trip.type === 'take_me_home') tmhCount++;
    if (trip.type === 'chauffeur') chauffeurCount++;

    const fare = parseFloat(trip.fare) || 0;
    const net = parseFloat(trip.netFare) || fare;

    if (isDone) {
      allTimeCompletedCount++;
      allTimeGross += fare;
      allTimeNet += net;
    }

    // Determine trip date
    let tripDate;
    if (trip.date) {
      // "YYYY-MM-DD"
      tripDate = new Date(`${trip.date}T12:00:00Z`);
    } else if (trip.createdAt) {
      tripDate = new Date(trip.createdAt);
    } else {
      tripDate = new Date();
    }

    const inCycle = tripDate >= fridayInfo.cycleStart && tripDate <= fridayInfo.nextFriday;

    if (inCycle) {
      if (isCancelled) {
        cancelledPausedCount++;
      } else {
        cycleTrips.push(trip);
      }
    }
  });

  // Calculate Friday Pool for qualifying completed trips in this cycle
  let cycleGrossFare = 0;
  let cycleTotalCosts = 0;
  let cycleNetPool = 0;
  let driverPayout = 0;
  let driverSplitShare = 0;
  let driverTripsCount = 0;
  let driverReimbursement = 0;

  cycleTrips.forEach(trip => {
    const splits = calculateTripSplits(trip);
    cycleGrossFare += splits.grossFare;
    cycleTotalCosts += splits.totalExtraCosts;
    cycleNetPool += splits.netFare;

    if (userName) {
      const lead = (splits.leadDriver || '').trim().toLowerCase();
      const chase = (splits.chaseDriver || '').trim().toLowerCase();

      if (lead === userName) {
        driverSplitShare += splits.leadDriverShare;
        driverReimbursement += splits.leadReimbursement;
        driverPayout += splits.leadFinalPayout;
        driverTripsCount++;
      } else if (chase === userName) {
        driverSplitShare += splits.chaseDriverShare;
        driverReimbursement += splits.chaseReimbursement;
        driverPayout += splits.chaseFinalPayout;
        driverTripsCount++;
      }
    }
  });

  return {
    fridayInfo,
    cycleTripsCount: cycleTrips.length,
    cycleGrossFare,
    cycleTotalCosts,
    cycleNetPool,
    driverPayout,
    driverSplitShare,
    driverTripsCount,
    driverReimbursement,
    cancelledPausedCount,
    allTimeCompletedCount,
    allTimeGross,
    allTimeNet,
    tmhCount,
    chauffeurCount,
    totalTripsCount: trips.length
  };
}
