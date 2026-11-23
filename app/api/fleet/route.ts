import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function isAdmin() {
  const session = await getSession();
  return !!session && session.role === 'ADMIN';
}

function parseOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return NaN;
  }
  return Math.round(num);
}

function parseOptionalDate(value: unknown): Date | null {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date('invalid');
  }
  return date;
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [drivers, vehicles] = await Promise.all([
      prisma.driver.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.vehicle.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          maintenanceLogs: {
            orderBy: [
              { serviceDate: 'desc' },
              { createdAt: 'desc' },
            ],
            take: 5,
          },
        },
      }),
    ]);

    return NextResponse.json({ drivers, vehicles });
  } catch (error) {
    console.error('Fleet fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fleet.' },
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
    const { type } = body;

    if (type === 'driver') {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const phone =
        typeof body.phone === 'string' && body.phone.trim()
          ? body.phone.trim()
          : null;

      if (!name) {
        return NextResponse.json(
          { error: 'Driver name is required.' },
          { status: 400 }
        );
      }

      const driver = await prisma.driver.create({
        data: { name, phone },
      });

      return NextResponse.json(driver, { status: 201 });
    }

    if (type === 'vehicle') {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const make = typeof body.make === 'string' ? body.make.trim() : '';
      const model = typeof body.model === 'string' ? body.model.trim() : '';
      const registrationNumber =
        typeof body.registrationNumber === 'string'
          ? body.registrationNumber.trim().toUpperCase()
          : '';
      const category =
        typeof body.category === 'string' ? body.category.trim() : '';

      if (!name || !make || !model || !registrationNumber || !category) {
        return NextResponse.json(
          { error: 'All vehicle fields are required.' },
          { status: 400 }
        );
      }

      const odometerKm = parseOptionalInt(body.odometerKm);
      if (typeof odometerKm === 'number' && Number.isNaN(odometerKm)) {
        return NextResponse.json(
          { error: 'Odometer must be a valid non-negative number.' },
          { status: 400 }
        );
      }

      const insuranceExpiry = parseOptionalDate(body.insuranceExpiry);
      if (insuranceExpiry && Number.isNaN(insuranceExpiry.getTime())) {
        return NextResponse.json(
          { error: 'Invalid insurance expiry date.' },
          { status: 400 }
        );
      }

      const registrationExpiry = parseOptionalDate(body.registrationExpiry);
      if (registrationExpiry && Number.isNaN(registrationExpiry.getTime())) {
        return NextResponse.json(
          { error: 'Invalid registration expiry date.' },
          { status: 400 }
        );
      }

      const vehicle = await prisma.vehicle.create({
        data: {
          name,
          make,
          model,
          registrationNumber,
          category,
          odometerKm,
          insuranceExpiry,
          registrationExpiry,
          notes:
            typeof body.notes === 'string' && body.notes.trim()
              ? body.notes.trim()
              : null,
        },
      });

      return NextResponse.json(vehicle, { status: 201 });
    }

    if (type === 'oil_change') {
      const vehicleId =
        typeof body.vehicleId === 'string' ? body.vehicleId.trim() : '';
      const serviceOdometerKm = parseOptionalInt(body.serviceOdometerKm);
      const intervalKm = parseOptionalInt(body.intervalKm);

      if (!vehicleId) {
        return NextResponse.json(
          { error: 'Vehicle is required.' },
          { status: 400 }
        );
      }

      if (
        serviceOdometerKm === null ||
        Number.isNaN(serviceOdometerKm) ||
        serviceOdometerKm < 0
      ) {
        return NextResponse.json(
          { error: 'Enter a valid odometer reading in km.' },
          { status: 400 }
        );
      }

      if (intervalKm !== 5000 && intervalKm !== 10000) {
        return NextResponse.json(
          { error: 'Oil interval must be either 5,000 km or 10,000 km.' },
          { status: 400 }
        );
      }

      const parsedServiceDate = parseOptionalDate(body.serviceDate);
      if (parsedServiceDate && Number.isNaN(parsedServiceDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid oil change date.' },
          { status: 400 }
        );
      }

      const existingVehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
      });

      if (!existingVehicle) {
        return NextResponse.json(
          { error: 'Vehicle not found.' },
          { status: 404 }
        );
      }

      const nextOilChangeKm = serviceOdometerKm + intervalKm;
      const shouldUpdateVehicleOdometer =
        existingVehicle.odometerKm === null ||
        serviceOdometerKm > existingVehicle.odometerKm;

      const [log] = await prisma.$transaction([
        prisma.vehicleMaintenance.create({
          data: {
            vehicleId,
            serviceType: 'OIL_CHANGE',
            serviceDate: parsedServiceDate ?? new Date(),
            serviceOdometerKm,
            intervalKm,
            nextOilChangeKm,
            notes:
              typeof body.notes === 'string' && body.notes.trim()
                ? body.notes.trim()
                : null,
          },
        }),
        ...(shouldUpdateVehicleOdometer
          ? [
              prisma.vehicle.update({
                where: { id: vehicleId },
                data: { odometerKm: serviceOdometerKm },
              }),
            ]
          : []),
      ]);

      return NextResponse.json(log, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid fleet record type.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Fleet create error:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'This registration number is already registered.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create fleet record.' },
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
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const make = typeof body.make === 'string' ? body.make.trim() : '';
    const model = typeof body.model === 'string' ? body.model.trim() : '';
    const registrationNumber =
      typeof body.registrationNumber === 'string'
        ? body.registrationNumber.trim().toUpperCase()
        : '';
    const category =
      typeof body.category === 'string' ? body.category.trim() : '';
    const status =
      typeof body.status === 'string' && body.status.trim()
        ? body.status.trim().toUpperCase()
        : 'AVAILABLE';

    if (!id || !name || !make || !model || !registrationNumber || !category) {
      return NextResponse.json(
        { error: 'All vehicle fields are required.' },
        { status: 400 }
      );
    }

    const odometerKm = parseOptionalInt(body.odometerKm);
    if (typeof odometerKm === 'number' && Number.isNaN(odometerKm)) {
      return NextResponse.json(
        { error: 'Odometer must be a valid non-negative number.' },
        { status: 400 }
      );
    }

    const insuranceExpiry = parseOptionalDate(body.insuranceExpiry);
    if (insuranceExpiry && Number.isNaN(insuranceExpiry.getTime())) {
      return NextResponse.json(
        { error: 'Invalid insurance expiry date.' },
        { status: 400 }
      );
    }

    const registrationExpiry = parseOptionalDate(body.registrationExpiry);
    if (registrationExpiry && Number.isNaN(registrationExpiry.getTime())) {
      return NextResponse.json(
        { error: 'Invalid registration expiry date.' },
        { status: 400 }
      );
    }

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        name,
        make,
        model,
        registrationNumber,
        category,
        status,
        odometerKm,
        insuranceExpiry,
        registrationExpiry,
        notes:
          typeof body.notes === 'string' && body.notes.trim()
            ? body.notes.trim()
            : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Fleet update error:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'This registration number is already registered.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update vehicle.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const odometerKm = parseOptionalInt(body.odometerKm);

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required.' },
        { status: 400 }
      );
    }

    if (
      odometerKm === null ||
      Number.isNaN(odometerKm) ||
      odometerKm < 0
    ) {
      return NextResponse.json(
        { error: 'Enter a valid non-negative odometer reading.' },
        { status: 400 }
      );
    }

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { odometerKm },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Fleet odometer patch error:', error);
    return NextResponse.json(
      { error: 'Failed to update odometer.' },
      { status: 500 }
    );
  }
}