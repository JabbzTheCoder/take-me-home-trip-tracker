// lib/splits.js - Official TMH Driver Fare Splits & Extra Costs Calculator

/**
 * Calculates net fare, expense reimbursements, and driver payout splits for a trip.
 * 
 * @param {Object} trip - The trip object containing fare, type, drivers, extraCosts, and splits.
 * @returns {Object} Comprehensive split breakdown.
 */
export function calculateTripSplits(trip) {
  if (!trip) {
    return {
      grossFare: 0,
      extraCosts: [],
      totalExtraCosts: 0,
      netFare: 0,
      splitType: 'equal_50_50',
      leadDriver: 'Lead Driver',
      chaseDriver: 'Chase Driver',
      leadDriverShare: 0,
      chaseDriverShare: 0,
      companyShare: 0,
      reimbursements: {},
      leadReimbursement: 0,
      chaseReimbursement: 0,
      leadFinalPayout: 0,
      chaseFinalPayout: 0,
    };
  }

  const grossFare = parseFloat(trip.fare) || 0;
  const extraCosts = Array.isArray(trip.extraCosts) ? trip.extraCosts : [];

  // Calculate sum of extra costs (fuel, tolls, car wash, etc.)
  const totalExtraCosts = extraCosts.reduce((acc, item) => {
    const val = parseFloat(item.amount) || 0;
    return acc + Math.max(0, val);
  }, 0);

  // Net fare available for driver distribution after deducting costs
  const netFare = Math.max(0, grossFare - totalExtraCosts);

  // Track who paid what so they get reimbursed
  const reimbursements = {};
  extraCosts.forEach(item => {
    const payer = (item.paidBy || 'Company').trim();
    const amt = parseFloat(item.amount) || 0;
    if (payer && amt > 0) {
      reimbursements[payer] = (reimbursements[payer] || 0) + amt;
    }
  });

  const isTakeMeHome = trip.type === 'take_me_home';
  const leadDriver = (trip.clientDriverName || trip.driverName || 'Lead Driver').trim();
  const chaseDriver = (trip.chaseDriverName || 'Chase Driver').trim();

  const userSplit = trip.splits || {};
  const splitType = userSplit.splitType || (isTakeMeHome ? 'equal_50_50' : 'single_driver');
  const companyShare = Math.max(0, parseFloat(userSplit.companyAmount) || 0);

  let leadDriverShare = 0;
  let chaseDriverShare = 0;

  if (isTakeMeHome) {
    const pool = Math.max(0, netFare - companyShare);

    if (splitType === 'equal_50_50') {
      leadDriverShare = Math.round((pool / 2) * 100) / 100;
      chaseDriverShare = Math.round((pool - leadDriverShare) * 100) / 100;
    } else if (splitType === 'custom_percent') {
      const leadPct = parseFloat(userSplit.leadDriverPercent) || 50;
      leadDriverShare = Math.round((pool * (leadPct / 100)) * 100) / 100;
      chaseDriverShare = Math.round((pool - leadDriverShare) * 100) / 100;
    } else if (splitType === 'custom_amount') {
      leadDriverShare = Math.max(0, parseFloat(userSplit.leadDriverAmount) || 0);
      chaseDriverShare = Math.max(0, parseFloat(userSplit.chaseDriverAmount) || 0);
    } else {
      leadDriverShare = Math.round((pool / 2) * 100) / 100;
      chaseDriverShare = Math.round((pool - leadDriverShare) * 100) / 100;
    }
  } else {
    // Solo Chauffeur
    leadDriverShare = Math.max(0, netFare - companyShare);
    chaseDriverShare = 0;
  }

  // Reimbursements for drivers who paid out of pocket
  const leadReimbursement = reimbursements[leadDriver] || 0;
  const chaseReimbursement = reimbursements[chaseDriver] || 0;

  // Final Payout = Split Share + Expense Reimbursement
  const leadFinalPayout = Math.round((leadDriverShare + leadReimbursement) * 100) / 100;
  const chaseFinalPayout = Math.round((chaseDriverShare + chaseReimbursement) * 100) / 100;

  return {
    grossFare,
    extraCosts,
    totalExtraCosts,
    netFare,
    splitType,
    isTakeMeHome,
    leadDriver,
    chaseDriver,
    leadDriverShare,
    chaseDriverShare,
    companyShare,
    reimbursements,
    leadReimbursement,
    chaseReimbursement,
    leadFinalPayout,
    chaseFinalPayout,
  };
}

export const EXTRA_COST_CATEGORIES = [
  { id: 'fuel', label: 'Fuel / Petrol', icon: '⛽', placeholder: 'e.g. BP Garage Unleaded 95' },
  { id: 'toll', label: 'Toll Gate', icon: '🛣️', placeholder: 'e.g. N1 South Toll Plaza' },
  { id: 'wash', label: 'Car Wash / Cleaning', icon: '🧼', placeholder: 'e.g. Escort vehicle wash' },
  { id: 'parking', label: 'Parking Fee', icon: '🅿️', placeholder: 'e.g. Mall basement parking' },
  { id: 'other', label: 'Other Expense', icon: '📦', placeholder: 'e.g. Water / essentials for client' },
];
