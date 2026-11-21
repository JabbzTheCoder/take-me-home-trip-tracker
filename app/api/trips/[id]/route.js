import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendTripChangeNotification } from '@/lib/email';
import {
  getTripAcceptedNotification,
  getTripDeclinedNotification,
  getTripCompletionNotifications,
  getTripChangeNotification
} from '@/lib/whatsapp';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const trip = await dbService.getTripById(id);
    if (!trip) {
      return NextResponse.json({
        success: false,
        message: 'Trip record not found'
      }, { status: 404 });
    }

    const user = getUserFromRequest(req);
    let isAssigned = false;
    let isPrimaryDriver = false;
    let isSecondaryDriver = false;

    if (user) {
      const userName = (user.name || '').trim().toLowerCase();
      const isTakeMeHome = trip.type === 'take_me_home';
      isPrimaryDriver = isTakeMeHome
        ? (trip.clientDriverName && trip.clientDriverName.trim().toLowerCase() === userName)
        : (trip.driverName && trip.driverName.trim().toLowerCase() === userName);
      isSecondaryDriver = isTakeMeHome && trip.chaseDriverName && trip.chaseDriverName.trim().toLowerCase() === userName;
      isAssigned = isPrimaryDriver || isSecondaryDriver;
    }

    return NextResponse.json({
      success: true,
      trip,
      authenticated: !!user,
      currentUser: user ? { id: user.id || user._id, name: user.name, role: user.role } : null,
      isAssigned,
      isPrimaryDriver,
      isSecondaryDriver
    });
  } catch (err) {
    console.error('Get trip error:', err);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve trip'
    }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: missing or invalid session token'
      }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // 1. Fetch current trip to check driver assignment and lock status
    const existing = await dbService.getTripById(id);
    if (!existing) {
      return NextResponse.json({
        success: false,
        message: 'Trip record not found'
      }, { status: 404 });
    }

    // 2. Strict Driver Authorization: Only assigned drivers can edit / act on trip
    const userName = (user.name || '').trim().toLowerCase();
    const isTakeMeHome = existing.type === 'take_me_home';
    const isPrimaryDriver = isTakeMeHome
      ? (existing.clientDriverName && existing.clientDriverName.trim().toLowerCase() === userName)
      : (existing.driverName && existing.driverName.trim().toLowerCase() === userName);
    const isSecondaryDriver = isTakeMeHome && existing.chaseDriverName && existing.chaseDriverName.trim().toLowerCase() === userName;
    const isAssigned = isPrimaryDriver || isSecondaryDriver;

    if (!isAssigned) {
      const assignedNames = isTakeMeHome
        ? `${existing.clientDriverName || 'Lead'} & ${existing.chaseDriverName || 'Chase'}`
        : `${existing.driverName || 'Driver'}`;

      return NextResponse.json({
        success: false,
        message: `Permission denied: Trips are actionable only by assigned drivers (${assignedNames}). Other drivers may view but cannot modify.`
      }, { status: 403 });
    }

    // 3. Status Lock Rule: Once a trip is marked as Completed, it is permanently locked
    if (existing.status === 'completed') {
      return NextResponse.json({
        success: false,
        message: 'Trip is completed and locked. Once finalized as Completed, trip details, splits, costs, and status cannot be modified.'
      }, { status: 400 });
    }

    // Disallow in_progress status
    if (body.status === 'in_progress') {
      return NextResponse.json({
        success: false,
        message: 'Invalid status: "in_progress" has been retired.'
      }, { status: 400 });
    }

    const allUsers = await dbService.getAllBrothers();
    const action = body.action || '';
    const updatePayload = { ...body };
    delete updatePayload.action;

    let responseMessage = 'Trip updated successfully!';
    let whatsappPayload = null;

    // 4. ACTION DISPATCH: Accept, Decline, Complete, or Cancel/Pause
    if (action === 'accept' || body.status === 'confirmed') {
      // 2.4 Secondary Driver accepts trip -> status moves to 'confirmed'
      updatePayload.status = 'confirmed';
      updatePayload.confirmedAt = new Date().toISOString();
      updatePayload.confirmedBy = user.name || 'Assigned Driver';

      // 2.5 Generate WhatsApp message for Primary Driver
      const updatedMock = { ...existing.toObject ? existing.toObject() : existing, ...updatePayload };
      whatsappPayload = {
        type: 'accepted',
        ...getTripAcceptedNotification(updatedMock, user.name, undefined, allUsers)
      };
      responseMessage = 'Trip assignment accepted! Status is now Confirmed.';

    } else if (action === 'decline' || body.status === 'declined') {
      // 2.4 Secondary Driver declines trip with reason -> status moves to 'declined'
      const reason = (body.declineReason || '').trim();
      if (!reason) {
        return NextResponse.json({
          success: false,
          message: 'A reason is required when declining a trip assignment.'
        }, { status: 400 });
      }

      updatePayload.status = 'declined';
      updatePayload.declinedAt = new Date().toISOString();
      updatePayload.declinedBy = user.name || 'Assigned Driver';
      updatePayload.declineReason = reason;

      // 2.5 Generate WhatsApp message for Primary Driver
      const updatedMock = { ...existing.toObject ? existing.toObject() : existing, ...updatePayload };
      whatsappPayload = {
        type: 'declined',
        ...getTripDeclinedNotification(updatedMock, user.name, reason, undefined, allUsers)
      };
      responseMessage = 'Trip assignment declined. Primary driver will be notified.';

    } else if (action === 'complete' || body.status === 'completed') {
      // 2.6 Assigned driver completes trip -> moves to 'completed', permanently locked
      updatePayload.status = 'completed';
      updatePayload.completedAt = new Date().toISOString();
      updatePayload.completedBy = user.name || 'Assigned Driver';

      const updatedMock = { ...existing.toObject ? existing.toObject() : existing, ...updatePayload };
      whatsappPayload = {
        type: 'completed',
        ...getTripCompletionNotifications(updatedMock, user.name, undefined, allUsers)
      };
      responseMessage = 'Trip marked as Completed and locked! Completion summary sent to assigned drivers.';

    } else {
      const isCancelledOrPaused =
        body.status === 'deferred' ||
        body.status === 'cancelled' ||
        body.status === 'paused' ||
        body.status === 'cancelled_paused';

      if (isCancelledOrPaused) {
        updatePayload.deferredAt = new Date().toISOString();
        updatePayload.deferredBy = user.name || 'Assigned Driver';
        if (body.deferReason) updatePayload.deferReason = body.deferReason;

        const updatedMock = { ...existing.toObject ? existing.toObject() : existing, ...updatePayload };
        const changeAlerts = getTripChangeNotification(
          updatedMock,
          user.name,
          `Status changed to Cancelled / Paused (Reason: ${body.deferReason || 'Client request'})`,
          undefined,
          allUsers
        );
        whatsappPayload = {
          type: 'cancelled_paused',
          alerts: changeAlerts
        };
        responseMessage = 'Trip has been marked as Cancelled / Paused.';
      } else {
        // Details change between confirmed and completed
        const changes = [];
        if (body.extraCosts !== undefined) changes.push('Extra costs recorded');
        if (body.splits !== undefined) changes.push('Driver splits updated');
        if (body.notes !== undefined && body.notes !== existing.notes) changes.push('Trip notes updated');
        if (body.fare !== undefined && Number(body.fare) !== Number(existing.fare)) changes.push(`Fare set to R${body.fare}`);
        if (body.pickup && body.pickup !== existing.pickup) changes.push(`Pickup changed to ${body.pickup}`);
        if (body.dropoff && body.dropoff !== existing.dropoff) changes.push(`Dropoff changed to ${body.dropoff}`);
        if (changes.length === 0) changes.push('Trip details modified');

        const changeSummary = changes.join(' • ');
        const updatedMock = { ...existing.toObject ? existing.toObject() : existing, ...updatePayload };
        const changeAlerts = getTripChangeNotification(updatedMock, user.name, changeSummary, undefined, allUsers);
        whatsappPayload = {
          type: 'details_updated',
          alerts: changeAlerts
        };
      }
    }

    // 5. Update Database Record
    const updated = await dbService.updateTrip(id, updatePayload);
    if (!updated) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update trip record'
      }, { status: 500 });
    }

    // 6. Asynchronously send email notification to assigned drivers
    const changesSummaryText = body.status && body.status !== existing.status
      ? `Status changed from "${existing.status}" to "${body.status}"`
      : 'Trip record updated';

    sendTripChangeNotification({
      trip: updated,
      previousTrip: existing,
      updatedBy: user,
      changeSummary: changesSummaryText
    }).catch(err => console.error('Background email dispatch error:', err));

    return NextResponse.json({
      success: true,
      message: responseMessage,
      trip: updated,
      whatsappPayload,
      emailNotified: true
    });
  } catch (err) {
    console.error('Update trip error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Failed to update trip'
    }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: missing or invalid session token'
      }, { status: 401 });
    }

    // Statutory and business policy compliance: Hard deletion is strictly prohibited
    return NextResponse.json({
      success: false,
      message: 'Audit Policy: Trips cannot be deleted once created. Please change the status to "Cancelled / Paused" and provide a reason.'
    }, { status: 400 });
  } catch (err) {
    console.error('Delete trip error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Operation not permitted'
    }, { status: 500 });
  }
}
