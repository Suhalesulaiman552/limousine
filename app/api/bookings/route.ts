import { NextResponse } from 'next/server';

// Temporary in-memory fallback list if database is unreachable
let mockBookings: any[] = [
  {
    id: '1',
    clientName: 'Sheikh Mohammed',
    driverName: 'Ahmed',
    pickupLocation: 'Berlin Airport BER',
    dropoffLocation: 'Adlon Kempinski Berlin',
    bookingDate: new Date().toISOString(),
    status: 'SCHEDULED',
    vehicle: 'Toyota Camry'
  }
];

export async function GET() {
  try {
    return NextResponse.json(mockBookings);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch bookings.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, driverName, pickupLocation, dropoffLocation, bookingDate, vehicle, status } = body;

    // Validate core fields
    if (!clientName || !pickupLocation || !dropoffLocation || !bookingDate || !vehicle) {
      return NextResponse.json({ error: 'All core fields are required.' }, { status: 400 });
    }

    const newBooking = {
      id: Date.now().toString(),
      clientName,
      driverName: driverName || 'Unassigned',
      pickupLocation,
      dropoffLocation,
      bookingDate,
      vehicle,
      status: status || 'SCHEDULED'
    };

    mockBookings.unshift(newBooking);
    return NextResponse.json(newBooking, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process booking.' }, { status: 500 });
  }
}