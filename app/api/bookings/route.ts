import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all bookings
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, clientPhone, vehicle, pickup, dropoff } = body;

    if (!clientName || !clientPhone || !vehicle || !pickup || !dropoff) {
      return NextResponse.json({ error: 'All booking fields are required.' }, { status: 400 });
    }

    const newBooking = await prisma.booking.create({
      data: {
        clientName,
        clientPhone,
        vehicle,
        pickup,
        dropoff,
      },
    });

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}