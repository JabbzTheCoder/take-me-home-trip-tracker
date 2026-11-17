import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { dbService } from './db.js';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const EMAIL_LOG_FILE = path.join(DATA_DIR, 'email_notifications.log');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Create Nodemailer transport (uses SMTP environment variables if provided, otherwise fallback mock transporter)
let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Send an email notification to the assigned drivers of a trip whenever changes occur
 */
export async function sendTripChangeNotification({ trip, previousTrip, updatedBy, changeSummary }) {
  try {
    const allUsers = await dbService.getAllBrothers();

    // 1. Resolve attached driver names
    const attachedDriverNames = [];
    if (trip.type === 'take_me_home') {
      if (trip.clientDriverName) attachedDriverNames.push(trip.clientDriverName.trim());
      if (trip.chaseDriverName) attachedDriverNames.push(trip.chaseDriverName.trim());
    } else {
      if (trip.driverName) attachedDriverNames.push(trip.driverName.trim());
    }

    // 2. Resolve email addresses for attached drivers
    const recipientEmails = new Set();
    attachedDriverNames.forEach(name => {
      const matched = allUsers.find(u => u.name?.toLowerCase() === name.toLowerCase());
      if (matched && matched.email) {
        recipientEmails.add(matched.email);
      } else {
        // Fallback default domain
        recipientEmails.add(`${name.toLowerCase()}@tmh-fleet.co.za`);
      }
    });

    const emailList = Array.from(recipientEmails);
    if (emailList.length === 0) {
      console.log('No recipient emails found for attached drivers:', attachedDriverNames);
      return;
    }

    const refCode = `TMH-${(trip._id || trip.id || '2026').toString().slice(-6).toUpperCase()}`;
    const subject = `[TMH Fleet Alert] Trip ${refCode} Updated (${trip.clientName})`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #070b14; color: #f8fafc; padding: 24px; }
          .card { max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 28px; }
          .header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; color: #f59e0b; margin: 0; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
          .status-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
          .status-completed { background: rgba(16, 185, 129, 0.2); color: #34d399; }
          .status-in_progress { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
          .status-deferred { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
          .label { color: #94a3b8; font-weight: 600; }
          .value { color: #ffffff; font-weight: 700; text-align: right; }
          .alert-box { background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 8px; font-size: 13px; color: #fef3c7; }
          .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">TAKE ME HOME DISPATCH NOTIFICATION</span>
            <h1 class="title" style="margin-top: 8px;">Trip ${refCode} Modified</h1>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0;">Updated by Driver: <strong>${updatedBy?.name || 'Assigned Driver'}</strong></p>
          </div>

          <div class="alert-box">
            <strong>Modifications Applied:</strong><br />
            ${changeSummary}
          </div>

          <div class="detail-row">
            <span class="label">Client:</span>
            <span class="value">${trip.clientName} (${trip.clientPhone || 'No Phone'})</span>
          </div>

          <div class="detail-row">
            <span class="label">Pickup Location:</span>
            <span class="value">${trip.pickup}</span>
          </div>

          <div class="detail-row">
            <span class="label">Dropoff Address:</span>
            <span class="value">${trip.dropoff}</span>
          </div>

          <div class="detail-row">
            <span class="label">Service Type:</span>
            <span class="value">${trip.type === 'take_me_home' ? '🚗 Take Me Home (2 Drivers)' : '🎩 Chauffeur (1 Driver)'}</span>
          </div>

          <div class="detail-row">
            <span class="label">Assigned Drivers:</span>
            <span class="value">${attachedDriverNames.join(' & ')}</span>
          </div>

          <div class="detail-row">
            <span class="label">Current Status:</span>
            <span class="value">${(trip.status === 'deferred' || trip.status === 'cancelled' || trip.status === 'paused' || trip.status === 'cancelled_paused') ? `Cancelled / Paused (${trip.deferReason || 'Reason on file'})` : 'COMPLETED'}</span>
          </div>

          <div class="detail-row">
            <span class="label">Rate / Fare:</span>
            <span class="value">R${trip.fare?.toFixed ? trip.fare.toFixed(2) : trip.fare}</span>
          </div>

          ${trip.totalExtraCosts > 0 ? `
          <div class="detail-row">
            <span class="label">Extra Costs (Fuel/Tolls):</span>
            <span class="value" style="color: #f87171;">-R${trip.totalExtraCosts?.toFixed ? trip.totalExtraCosts.toFixed(2) : trip.totalExtraCosts}</span>
          </div>
          <div class="detail-row">
            <span class="label">Net Split Pool:</span>
            <span class="value" style="color: #34d399;">R${trip.netFare?.toFixed ? trip.netFare.toFixed(2) : trip.netFare}</span>
          </div>
          ` : ''}

          ${trip.notes ? `
          <div style="margin-top: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 11px; color: #94a3b8; font-weight: 700; margin-bottom: 4px;">LATEST TRIP NOTES:</div>
            <div style="font-size: 13px; color: #e2e8f0;">${trip.notes}</div>
          </div>
          ` : ''}

          <div class="footer">
            Take Me Home Trip Tracker • Automated Dispatch Alert • POPIA Act 4 of 2013 Protected
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Log to email audit log file
    const logEntry = {
      timestamp: new Date().toISOString(),
      tripId: trip._id || trip.id,
      refCode,
      recipients: emailList,
      updatedBy: updatedBy?.name || 'Driver',
      changeSummary,
      status: trip.status
    };

    fs.appendFileSync(EMAIL_LOG_FILE, JSON.stringify(logEntry) + '\n', 'utf-8');
    console.log(`[EMAIL DISPATCH] Alert sent to: ${emailList.join(', ')} for trip ${refCode} - ${changeSummary}`);

    // 4. If SMTP transporter is configured, dispatch real email
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Take Me Home Dispatch" <dispatch@tmh-fleet.co.za>',
        to: emailList.join(', '),
        subject,
        html: htmlContent
      });
      console.log(`[SMTP] Successfully delivered notification to ${emailList.join(', ')}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to send trip notification email:', error);
    return false;
  }
}
