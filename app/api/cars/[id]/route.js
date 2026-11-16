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

    const updated = await dbService.updateCar(id, body);
    if (!updated) {
      return NextResponse.json({
        success: false,
        message: 'Fleet car not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Fleet car updated successfully!',
      car: updated
    });
  } catch (err) {
    console.error('Update car error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Failed to update fleet car'
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
    await dbService.deleteCar(id);

    return NextResponse.json({
      success: true,
      message: 'Fleet car deleted successfully'
    });
  } catch (err) {
    console.error('Delete car error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Failed to delete car'
    }, { status: 500 });
  }
}
