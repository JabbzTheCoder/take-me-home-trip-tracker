// lib/whatsapp.js - WhatsApp Notification & Link Generator for Take Me Home Fleet Operations
import { formatCurrency } from './helpers.js';
import { calculateTripSplits } from './splits.js';

// Fallback directory of drivers and registered mobile numbers
export const DRIVER_DIRECTORY = [
  { name: 'Jabbz', phone: '+27 82 450 1198' },
  { name: 'Tebza', phone: '+27 73 892 4431' },
  { name: 'Fresh', phone: '+27 84 551 7732' }
];

/**
 * Normalizes phone numbers to standard E.164 without '+' for wa.me links
 * e.g. "+27 82 450 1198" -> "27824501198"
 * e.g. "0824501198" -> "27824501198"
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 10) {
    return `27${digits.slice(1)}`;
  }
  if (digits.startsWith('27') && digits.length === 11) {
    return digits;
  }
  return digits;
}

/**
 * Resolves driver's phone number from user list or default directory
 */
export function resolveDriverPhone(driverName, userList = []) {
  if (!driverName) return '';
  const cleanName = driverName.trim().toLowerCase();

  // Search in userList first
  const foundUser = userList.find(u => (u.name || '').trim().toLowerCase() === cleanName);
  if (foundUser?.phone) {
    return normalizePhoneNumber(foundUser.phone);
  }

  // Fallback to driver directory
  const foundDir = DRIVER_DIRECTORY.find(d => d.name.toLowerCase() === cleanName);
  if (foundDir?.phone) {
    return normalizePhoneNumber(foundDir.phone);
  }

  return '';
}

/**
 * Builds direct WhatsApp URL (wa.me) or generic share link if phone is omitted
 */
export function buildWhatsAppUrl(phone, text) {
  const cleanPhone = normalizePhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Helper to determine application base URL
 */
export function getBaseAppUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://take-me-home-trip-tracker.vercel.app';
}

/**
 * 2.2 Secondary Assigned Driver Dispatch:
 * Sent when a driver logs a trip (status == 'pending').
 */
export function getSecondaryDriverDispatchNotification(trip, baseUrl = getBaseAppUrl(), userList = []) {
  const tripId = trip._id || trip.id;
  const secondaryDriver = trip.chaseDriverName || 'Driver';
  const primaryDriver = trip.clientDriverName || trip.createdByDriver || 'Primary Driver';
  const phone = resolveDriverPhone(secondaryDriver, userList);
  const splitInfo = calculateTripSplits(trip);
  const scheduleDate = trip.date || new Date().toISOString().split('T')[0];
  const scheduleTime = trip.time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const tripLink = `${baseUrl}/trip/${tripId}`;

  const text = 
`🚗 *TAKE ME HOME — NEW TRIP ASSIGNMENT*

Hi ${secondaryDriver}, you have been assigned as the escort/chase driver for a new service trip:

📋 *Booking:* #${trip.invoiceNumber || 'NEW'} (${trip.profile === 'profile2' ? 'Profile 2' : 'Profile 1'})
👤 *Client:* ${trip.clientName}
${trip.clientPhone ? `📞 *Client Tel:* ${trip.clientPhone}\n` : ''}🕒 *Schedule:* ${scheduleDate} at ${scheduleTime}
📍 *Pickup:* ${trip.pickup}
🏁 *Dropoff:* ${trip.dropoff}
${trip.clientCar ? `🚘 *Client Car:* ${trip.clientCar}\n` : ''}${trip.chaseCar ? `🏎️ *Escort Vehicle:* ${trip.chaseCar}\n` : ''}
💰 *Gross Fare:* ${formatCurrency(trip.fare)}
👥 *Est. Split Share:* ${formatCurrency(splitInfo.chaseFinalPayout)}
👤 *Assigned Lead:* ${primaryDriver}

🔗 *Review & Accept/Decline Link:*
${tripLink}

_Please tap the link above to verify and accept or decline with a reason._`;

  return {
    recipientName: secondaryDriver,
    phone,
    text,
    url: buildWhatsAppUrl(phone, text),
    tripLink
  };
}

/**
 * 2.5 WhatsApp status update to Primary Driver when Secondary Driver Accepts
 */
export function getTripAcceptedNotification(trip, acceptedBy = '', baseUrl = getBaseAppUrl(), userList = []) {
  const tripId = trip._id || trip.id;
  const primaryDriver = trip.clientDriverName || trip.createdByDriver || 'Primary Driver';
  const secondaryDriver = acceptedBy || trip.chaseDriverName || 'Secondary Driver';
  const phone = resolveDriverPhone(primaryDriver, userList);
  const tripLink = `${baseUrl}/trip/${tripId}`;
  const scheduleDate = trip.date || new Date().toISOString().split('T')[0];
  const scheduleTime = trip.time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const text =
`✅ *TRIP ACCEPTED & CONFIRMED*

Hi ${primaryDriver}, your co-driver *${secondaryDriver}* has *ACCEPTED* trip #${trip.invoiceNumber || ''} for *${trip.clientName}*.

🕒 *Schedule:* ${scheduleDate} at ${scheduleTime}
📍 *Pickup:* ${trip.pickup}
🏁 *Dropoff:* ${trip.dropoff}
💰 *Fare:* ${formatCurrency(trip.fare)}

Status is now *Confirmed* 🤝

🔗 *View Trip:*
${tripLink}`;

  return {
    recipientName: primaryDriver,
    phone,
    text,
    url: buildWhatsAppUrl(phone, text),
    tripLink
  };
}

/**
 * 2.5 WhatsApp status update to Primary Driver when Secondary Driver Declines
 */
export function getTripDeclinedNotification(trip, declinedBy = '', reason = '', baseUrl = getBaseAppUrl(), userList = []) {
  const tripId = trip._id || trip.id;
  const primaryDriver = trip.clientDriverName || trip.createdByDriver || 'Primary Driver';
  const secondaryDriver = declinedBy || trip.chaseDriverName || 'Secondary Driver';
  const phone = resolveDriverPhone(primaryDriver, userList);
  const tripLink = `${baseUrl}/trip/${tripId}`;

  const text =
`❌ *TRIP ASSIGNMENT DECLINED*

Hi ${primaryDriver}, *${secondaryDriver}* was unable to accept trip #${trip.invoiceNumber || ''} for *${trip.clientName}*.

📝 *Reason:* "${reason || 'Unavailable / Schedule clash'}"
Status is now *Declined*. Please re-assign another driver or adjust the booking.

🔗 *View Trip:*
${tripLink}`;

  return {
    recipientName: primaryDriver,
    phone,
    text,
    url: buildWhatsAppUrl(phone, text),
    tripLink
  };
}

/**
 * 2.6 Trip Completed & Locked notification with splits to both drivers
 */
export function getTripCompletionNotifications(trip, completedBy = 'Assigned Driver', baseUrl = getBaseAppUrl(), userList = []) {
  const tripId = trip._id || trip.id;
  const splitInfo = calculateTripSplits(trip);
  const primaryDriver = trip.clientDriverName || trip.driverName || 'Lead Driver';
  const secondaryDriver = trip.chaseDriverName || 'Chase Driver';
  const tripLink = `${baseUrl}/trip/${tripId}`;

  const leadPhone = resolveDriverPhone(primaryDriver, userList);
  const chasePhone = resolveDriverPhone(secondaryDriver, userList);

  const baseSummary =
`🏁 *TRIP COMPLETED & LOCKED*

Trip #${trip.invoiceNumber || ''} for *${trip.clientName}* was completed by *${completedBy}*. Status is permanently locked.

📍 *Route:* ${trip.pickup} ➔ ${trip.dropoff}
💰 *Gross Fare:* ${formatCurrency(trip.fare)}
${splitInfo.totalExtraCosts > 0 ? `⛽ *Extra Costs:* -${formatCurrency(splitInfo.totalExtraCosts)}\n` : ''}💵 *Net Fare:* ${formatCurrency(splitInfo.netFare)}`;

  const leadText =
`${baseSummary}
👥 *Your Lead Split Payout:* ${formatCurrency(splitInfo.leadFinalPayout)}

🔗 *Trip Voucher:*
${tripLink}`;

  const chaseText =
`${baseSummary}
👥 *Your Escort Split Payout:* ${formatCurrency(splitInfo.chaseFinalPayout)}

🔗 *Trip Voucher:*
${tripLink}`;

  return {
    leadNotification: {
      recipientName: primaryDriver,
      phone: leadPhone,
      text: leadText,
      url: buildWhatsAppUrl(leadPhone, leadText),
      payout: splitInfo.leadFinalPayout
    },
    chaseNotification: {
      recipientName: secondaryDriver,
      phone: chasePhone,
      text: chaseText,
      url: buildWhatsAppUrl(chasePhone, chaseText),
      payout: splitInfo.chaseFinalPayout
    },
    splitInfo,
    tripLink
  };
}

/**
 * Alert assigned drivers of trip modifications, client cancellation or pausing
 */
export function getTripChangeNotification(trip, updaterName = 'Assigned Driver', changeSummary = '', baseUrl = getBaseAppUrl(), userList = []) {
  const tripId = trip._id || trip.id;
  const isCancelledOrPaused =
    trip.status === 'deferred' ||
    trip.status === 'cancelled' ||
    trip.status === 'paused' ||
    trip.status === 'cancelled_paused';

  const tripLink = `${baseUrl}/trip/${tripId}`;
  const statusDisplay = isCancelledOrPaused ? 'Cancelled / Paused' : (trip.status || 'Updated');

  const text =
`⚠️ *TRIP DETAILS / STATUS ALERT*

Trip #${trip.invoiceNumber || ''} for *${trip.clientName}* was updated by *${updaterName}*.

📋 *Status:* ${statusDisplay}
${isCancelledOrPaused && trip.deferReason ? `🛑 *Reason:* "${trip.deferReason}"\n` : ''}${changeSummary ? `📝 *Updates:* ${changeSummary}\n` : ''}📍 *Pickup:* ${trip.pickup}
🏁 *Dropoff:* ${trip.dropoff}

🔗 *Trip Link:*
${tripLink}`;

  // Build notifications for both drivers
  const drivers = [];
  if (trip.type === 'take_me_home') {
    if (trip.clientDriverName) drivers.push(trip.clientDriverName);
    if (trip.chaseDriverName) drivers.push(trip.chaseDriverName);
  } else if (trip.driverName) {
    drivers.push(trip.driverName);
  }

  return drivers.map(name => {
    const phone = resolveDriverPhone(name, userList);
    return {
      recipientName: name,
      phone,
      text,
      url: buildWhatsAppUrl(phone, text),
      tripLink
    };
  });
}
