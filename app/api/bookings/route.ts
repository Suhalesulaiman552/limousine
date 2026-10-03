import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { bookingDate: 'desc' },
    });
    return NextResponse.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return NextResponse.json({ error: 'Failed to fetch bookings from database.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, driverName, pickupLocation, dropoffLocation, bookingDate, vehicle, status } = body;

    if (!clientName || !pickupLocation || !dropoffLocation || !bookingDate || !vehicle) {
      return NextResponse.json({ error: 'All core fields are required.' }, { status: 400 });
    }

    const newBooking = await prisma.booking.create({
      data: {
        clientName,
        driverName: driverName || 'Unassigned',
        pickupLocation,
        dropoffLocation,
        bookingDate: new Date(bookingDate),
        vehicle,
        status: status || 'SCHEDULED',
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (err) {
    console.error('Error creating booking:', err);
    return NextResponse.json({ error: 'Failed to save booking to database.' }, { status: 500 });
  }
}