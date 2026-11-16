import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

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

    const updated = await dbService.updateTrip(id, body);
    if (!updated) {
      return NextResponse.json({
        success: false,
        message: 'Trip record not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Trip updated successfully!',
      trip: updated
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

    const { id } = await params;
    await dbService.deleteTrip(id);

    return NextResponse.json({
      success: true,
      message: 'Trip record deleted successfully'
    });
  } catch (err) {
    console.error('Delete trip error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Failed to delete trip'
    }, { status: 500 });
  }
}
