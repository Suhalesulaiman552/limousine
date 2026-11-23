
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const validStatuses = [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
];

const BOOKING_DURATION_HOURS = 2;

async function isAdmin() {
  const session = await getSession();
  return !!session && session.role === 'ADMIN';
}

async function checkBookingConflict(
  bookingDate: Date,
  vehicle: string,
  driverName: string | null,
  excludeId?: string
) {
  const windowMs = BOOKING_DURATION_HOURS * 60 * 60 * 1000;
  const start = new Date(bookingDate.getTime() - windowMs);
  const end = new Date(bookingDate.getTime() + windowMs);

  const conflicts = await prisma.booking.findMany({
    where: {
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      bookingDate: { gte: start, lte: end },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [
        { vehicle: vehicle.trim() },
        ...(driverName ? [{ driverName }] : []),
      ],
    },
  });

  if (conflicts.length === 0) return null;

  const vehicleConflict = conflicts.some(
    (b) => b.vehicle.trim() === vehicle.trim()
  );

  const driverConflict = driverName
    ? conflicts.some(
        (b) => b.driverName?.trim() === driverName.trim()
      )
    : false;

  if (vehicleConflict && driverConflict) {
    return 'This vehicle and driver are already assigned to another booking at a similar time.';
  }

  if (vehicleConflict) {
    return 'This vehicle is already assigned to another booking at a similar time.';
  }

  if (driverConflict) {
    return 'This driver is already assigned to another booking at a similar time.';
  }

  return null;
}

export async function GET(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const availabilityDate = url.searchParams.get('availabilityDate');

    // Availability check for the booking dropdowns
    if (availabilityDate) {
      const parsedDate = new Date(availabilityDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid availability date.' },
          { status: 400 }
        );
      }

      const excludeId = url.searchParams.get('excludeId');
      const windowMs = BOOKING_DURATION_HOURS * 60 * 60 * 1000;

      const conflicts = await prisma.booking.findMany({
        where: {
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          bookingDate: {
            gte: new Date(parsedDate.getTime() - windowMs),
            lte: new Date(parsedDate.getTime() + windowMs),
          },
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: {
          vehicle: true,
          driverName: true,
        },
      });

      return NextResponse.json({
        unavailableVehicles: [
          ...new Set(conflicts.map((b) => b.vehicle.trim())),
        ],
        unavailableDrivers: [
          ...new Set(
            conflicts
              .map((b) => b.driverName?.trim())
              .filter((name): name is string => !!name)
          ),
        ],
      });
    }

    // Normal booking list
    const bookings = await prisma.booking.findMany({
      orderBy: { bookingDate: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return NextResponse.json(
      { error: 'Failed to fetch bookings.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientName,
      driverName,
      pickupLocation,
      dropoffLocation,
      bookingDate,
      vehicle,
      status,
      price,
    } = body;

    if (
      typeof clientName !== 'string' || !clientName.trim() ||
      typeof pickupLocation !== 'string' || !pickupLocation.trim() ||
      typeof dropoffLocation !== 'string' || !dropoffLocation.trim() ||
      typeof bookingDate !== 'string' || !bookingDate ||
      typeof vehicle !== 'string' || !vehicle.trim()
    ) {
      return NextResponse.json(
        { error: 'All core fields are required.' },
        { status: 400 }
      );
    }

    const parsedDate = new Date(bookingDate);
    const parsedPrice = Number(price ?? 0);
    const bookingStatus = String(status || 'SCHEDULED').toUpperCase();

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid booking date.' }, { status: 400 });
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: 'Price must be a valid non-negative amount.' },
        { status: 400 }
      );
    }

    if (!validStatuses.includes(bookingStatus)) {
      return NextResponse.json({ error: 'Invalid booking status.' }, { status: 400 });
    }

    const normalizedDriver =
      typeof driverName === 'string' && driverName.trim()
        ? driverName.trim()
        : null;

    if (bookingStatus === 'SCHEDULED' || bookingStatus === 'CONFIRMED') {
      const conflict = await checkBookingConflict(
        parsedDate,
        vehicle.trim(),
        normalizedDriver
      );

      if (conflict) {
        return NextResponse.json({ error: conflict }, { status: 409 });
      }
    }

    const newBooking = await prisma.booking.create({
      data: {
        clientName: clientName.trim(),
        driverName: normalizedDriver,
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        bookingDate: parsedDate,
        vehicle: vehicle.trim(),
        price: parsedPrice,
        status: bookingStatus,
        cancelledAt: bookingStatus === 'CANCELLED' ? new Date() : null,
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (err) {
    console.error('Error creating booking:', err);
    return NextResponse.json(
      { error: 'Failed to save booking.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      clientName,
      driverName,
      pickupLocation,
      dropoffLocation,
      bookingDate,
      vehicle,
      status,
      price,
    } = body;

    if (
      typeof id !== 'string' || !id ||
      typeof clientName !== 'string' || !clientName.trim() ||
      typeof pickupLocation !== 'string' || !pickupLocation.trim() ||
      typeof dropoffLocation !== 'string' || !dropoffLocation.trim() ||
      typeof bookingDate !== 'string' || !bookingDate ||
      typeof vehicle !== 'string' || !vehicle.trim()
    ) {
      return NextResponse.json(
        { error: 'All core fields are required.' },
        { status: 400 }
      );
    }

    const parsedDate = new Date(bookingDate);
    const parsedPrice = Number(price);
    const bookingStatus = String(status || '').toUpperCase();

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid booking date.' }, { status: 400 });
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: 'Price must be a valid non-negative amount.' },
        { status: 400 }
      );
    }

    if (!validStatuses.includes(bookingStatus)) {
      return NextResponse.json({ error: 'Invalid booking status.' }, { status: 400 });
    }

    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const normalizedDriver =
      typeof driverName === 'string' && driverName.trim()
        ? driverName.trim()
        : null;

    if (bookingStatus === 'SCHEDULED' || bookingStatus === 'CONFIRMED') {
      const conflict = await checkBookingConflict(
        parsedDate,
        vehicle.trim(),
        normalizedDriver,
        id
      );

      if (conflict) {
        return NextResponse.json({ error: conflict }, { status: 409 });
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        clientName: clientName.trim(),
        driverName: normalizedDriver,
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        bookingDate: parsedDate,
        vehicle: vehicle.trim(),
        price: parsedPrice,
        status: bookingStatus,
        cancelledAt:
          bookingStatus === 'CANCELLED'
            ? existing.cancelledAt || new Date()
            : null,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (err) {
    console.error('Error updating booking:', err);
    return NextResponse.json(
      { error: 'Failed to update booking.' },
      { status: 500 }
    );
  }
}
