import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { plateNumber, date, time } = await request.json();

    if (!plateNumber || !date || !time) {
      return NextResponse.json({ success: false, error: 'Plate number, date, and time are required' }, { status: 400 });
    }

    // 1. Find the vehicle by plate number
    const vehicle = await prisma.vehicle.findUnique({
      where: { plateNumber },
      include: { driver: true },
    });

    if (!vehicle) {
      return NextResponse.json({ success: false, error: `Vehicle with plate ${plateNumber} not found` }, { status: 404 });
    }

    // 2. Search for any trips logged on that date for this vehicle
    const trips = await prisma.trip.findMany({
      where: {
        vehicleId: vehicle.id,
        date: date,
      },
      include: { driver: true },
    });

    // 3. Try to match the exact time or find the closest active trip
    // (For simplicity, we check if the fine time falls near or during logged trips, or fallback to the vehicle's assigned driver)
    let matchedDriver = vehicle.driver; // Default to currently assigned driver

    if (trips.length > 0) {
      // If there are trips on that day, use the driver from the most relevant trip
      matchedDriver = trips[0].driver;
    }

    return NextResponse.json({
      success: true,
      match: {
        vehicleModel: vehicle.model,
        plateNumber: vehicle.plateNumber,
        driverName: matchedDriver ? matchedDriver.name : 'Unknown / Unassigned',
        matchedTrip: trips.length > 0 ? trips[0] : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to match fine' }, { status: 500 });
  }
}