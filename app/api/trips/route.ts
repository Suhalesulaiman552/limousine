import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      include: { driver: true },
      orderBy: { id: 'desc' },
    });
    return NextResponse.json({ success: true, trips });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { driverId, customerName, phone, destination, price, date } = body;

    if (!driverId || !customerName || !phone || !destination || !price) {
      return NextResponse.json({ success: false, error: 'Missing required fields including phone' }, { status: 400 });
    }

    const newTrip = await prisma.trip.create({
      data: {
        driverId: Number(driverId),
        customerName,
        phone,
        destination,
        price: parseFloat(price),
        date: date || new Date().toISOString().split('T')[0],
      },
    });

    return NextResponse.json({ success: true, trip: newTrip });
  } catch (error: any) {
    console.error('Trip creation error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Database error creating trip' }, { status: 500 });
  }
}