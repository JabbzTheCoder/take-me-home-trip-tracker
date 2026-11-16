import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendTripChangeNotification } from '@/lib/email';

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

    // 1. Fetch current trip to check driver assignment
    const existing = await dbService.getTripById(id);
    if (!existing) {
      return NextResponse.json({
        success: false,
        message: 'Trip record not found'
      }, { status: 404 });
    }

    // 2. Strict Driver Authorization: Only attached drivers can edit
    const userName = (user.name || '').trim().toLowerCase();
    const isAttached = existing.type === 'take_me_home'
      ? (
          (existing.clientDriverName && existing.clientDriverName.trim().toLowerCase() === userName) ||
          (existing.chaseDriverName && existing.chaseDriverName.trim().toLowerCase() === userName)
        )
      : (
          existing.driverName && existing.driverName.trim().toLowerCase() === userName
        );

    if (!isAttached) {
      const assignedNames = existing.type === 'take_me_home'
        ? `${existing.clientDriverName || 'Driver 1'} & ${existing.chaseDriverName || 'Driver 2'}`
        : `${existing.driverName || 'Driver'}`;

      return NextResponse.json({
        success: false,
        message: `Permission denied: Trips are editable only by assigned drivers (${assignedNames}). Other drivers may view but cannot modify.`
      }, { status: 403 });
    }

    // 3. Compile change summary for email alert
    const changes = [];
    if (body.status && body.status !== existing.status) {
      const deferNote = body.status === 'deferred' ? ` (Reason: ${body.deferReason || 'Deferred by driver'})` : '';
      changes.push(`Status changed from "${existing.status}" to "${body.status}"${deferNote}`);
    }
    if (body.notes !== undefined && body.notes !== existing.notes) {
      changes.push(`Trip notes updated: "${body.notes}"`);
    }
    if (body.fare !== undefined && Number(body.fare) !== Number(existing.fare)) {
      changes.push(`Fare rate updated to R${body.fare}`);
    }
    if (body.pickup && body.pickup !== existing.pickup) {
      changes.push(`Pickup address modified: "${body.pickup}"`);
    }
    if (body.dropoff && body.dropoff !== existing.dropoff) {
      changes.push(`Dropoff address modified: "${body.dropoff}"`);
    }
    if (changes.length === 0) {
      changes.push('Trip itinerary or passenger details modified');
    }

    const changeSummary = changes.join(' • ');

    // 4. If status is changing to deferred, attach deferral metadata
    const updatePayload = { ...body };
    if (body.status === 'deferred') {
      updatePayload.deferredAt = new Date().toISOString();
      updatePayload.deferredBy = user.name || 'Assigned Driver';
    }

    const updated = await dbService.updateTrip(id, updatePayload);
    if (!updated) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update trip record'
      }, { status: 500 });
    }

    // 5. Asynchronously notify assigned drivers via email
    sendTripChangeNotification({
      trip: updated,
      previousTrip: existing,
      updatedBy: user,
      changeSummary
    }).catch(err => console.error('Background email dispatch error:', err));

    return NextResponse.json({
      success: true,
      message: body.status === 'deferred' ? 'Trip has been deferred.' : 'Trip updated successfully!',
      trip: updated,
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
      message: 'Audit Policy: Trips cannot be deleted once created. Please change the status to "Deferred" and provide a reason.'
    }, { status: 400 });
  } catch (err) {
    console.error('Delete trip error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Operation not permitted'
    }, { status: 500 });
  }
}
