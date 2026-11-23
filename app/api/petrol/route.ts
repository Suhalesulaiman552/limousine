import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get('driverId');

  try {
    const transactions = await prisma.petrolTransaction.findMany({
      where: driverId ? { driverId } : {},
      include: { driver: true, vehicle: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch petrol expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    let driverId = body.driverId;

    // If driverId is missing or invalid, fallback to the first available driver in the database
    if (!driverId) {
      const fallbackDriver = await prisma.driver.findFirst();
      if (!fallbackDriver) {
        return NextResponse.json({ error: 'No drivers exist in the system' }, { status: 400 });
      }
      driverId = fallbackDriver.id;
    }

    // Find driver and their vehicle
    let driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { vehicles: true },
    });

    let vehicleId = driver?.vehicles[0]?.id;

    if (!vehicleId) {
      const fallbackVehicle = await prisma.vehicle.findFirst();
      if (!fallbackVehicle) {
        return NextResponse.json({ error: 'No vehicles exist in the system' }, { status: 400 });
      }
      vehicleId = fallbackVehicle.id;
    }

    const petrol = await prisma.petrolTransaction.create({
      data: {
        driverId: driverId,
        vehicleId: vehicleId,
        amount: parseFloat(body.amount || '0'),
        liters: parseFloat(body.liters || '0'),
        receiptImage: body.receiptImage || '',
        date: body.date || new Date().toISOString().split('T')[0],
      },
    });

    return NextResponse.json({ success: true, petrol });
  } catch (error: any) {
    console.error('Petrol save error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save petrol expense' }, { status: 500 });
  }
}