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

    const cars = await dbService.getCars();
    return NextResponse.json({
      success: true,
      cars
    });
  } catch (err) {
    console.error('Fetch cars error:', err);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve cars'
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
    const { name, model, plate, color, fuelPercent, odometerKm, status } = body;

    if (!name || !model || !plate) {
      return NextResponse.json({
        success: false,
        message: 'Name, model and license plate are required.'
      }, { status: 400 });
    }

    const newCar = await dbService.createCar({
      name,
      model,
      plate,
      color: color || 'Midnight Black',
      fuelPercent: Number(fuelPercent) || 100,
      odometerKm: Number(odometerKm) || 0,
      status: status || 'active'
    });

    return NextResponse.json({
      success: true,
      message: 'Fleet car registered successfully!',
      car: newCar
    }, { status: 201 });
  } catch (err) {
    console.error('Add car error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Failed to add car'
    }, { status: 500 });
  }
}
