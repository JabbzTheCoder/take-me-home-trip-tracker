import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: missing or invalid session token'
      }, { status: 401 });
    }

    const trips = await dbService.getTrips();
    return NextResponse.json({
      success: true,
      trips
    });
  } catch (err) {
    console.error('Fetch trips error:', err);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve trips'
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: missing or invalid session token'
      }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      clientName,
      clientPhone,
      clientCar,
      pickup,
      dropoff,
      clientDriverName,
      chaseDriverName,
      chaseCar,
      driverName,
      car,
      fare,
      status,
      deferReason,
      extraCosts,
      splits,
      splitStops,
      notes,
      date,
      time,
      profile
    } = body;

    if (!type || !clientName || !pickup || !dropoff) {
      return NextResponse.json({
        success: false,
        message: 'Please provide required trip details (type, client name, pickup, dropoff).'
      }, { status: 400 });
    }

    const newTrip = await dbService.createTrip({
      type,
      clientName,
      clientPhone: clientPhone || '',
      clientCar: clientCar || '',
      pickup,
      dropoff,
      profile: profile || 'profile1',
      clientDriverName: clientDriverName || '',
      chaseDriverName: chaseDriverName || '',
      chaseCar: chaseCar || '',
      driverName: driverName || '',
      car: car || '',
      fare: Number(fare) || 0,
      status: (status === 'deferred' || status === 'cancelled' || status === 'paused' || status === 'cancelled_paused') ? status : 'completed',
      deferReason: deferReason || '',
      extraCosts: Array.isArray(extraCosts) ? extraCosts : [],
      splits: splits || undefined,
      splitStops: Array.isArray(splitStops) ? splitStops : [],
      notes: notes || '',
      date: date || new Date().toISOString().split('T')[0],
      time: time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    });

    return NextResponse.json({
      success: true,
      message: 'Trip logged successfully!',
      trip: newTrip
    }, { status: 201 });
  } catch (err) {
    console.error('Create trip error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Failed to record trip'
    }, { status: 500 });
  }
}
