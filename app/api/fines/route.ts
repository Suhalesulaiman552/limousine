
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function isAdmin() {
  const session = await getSession();
  return !!session && session.role === 'ADMIN';
}

function validateFine(body: any) {
  const {
    vehicleNumber,
    violation,
    amount,
    fineDate,
  } = body;

  if (
    typeof vehicleNumber !== 'string' || !vehicleNumber.trim() ||
    typeof violation !== 'string' || !violation.trim() ||
    amount === undefined || amount === null || amount === '' ||
    !Number.isFinite(Number(amount)) || Number(amount) < 0 ||
    typeof fineDate !== 'string' ||
    Number.isNaN(new Date(fineDate).getTime())
  ) {
    return false;
  }

  return true;
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fines = await prisma.fine.findMany({
      orderBy: { fineDate: 'desc' },
    });

    return NextResponse.json(fines);
  } catch (err) {
    console.error('Error fetching fines:', err);
    return NextResponse.json(
      { error: 'Failed to fetch fines.' },
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

    if (!validateFine(body)) {
      return NextResponse.json(
        { error: 'Please provide valid fine details.' },
        { status: 400 }
      );
    }

    const newFine = await prisma.fine.create({
      data: {
        vehicleNumber: body.vehicleNumber.trim(),
        driverName:
          typeof body.driverName === 'string' && body.driverName.trim()
            ? body.driverName.trim()
            : 'Unassigned',
        suggestedDriverName:
          typeof body.suggestedDriverName === 'string'
            ? body.suggestedDriverName.trim() || null
            : null,
        driverConfirmed: body.driverConfirmed === true,
        location:
          typeof body.location === 'string'
            ? body.location.trim() || null
            : null,
        violation: body.violation.trim(),
        amount: Number(body.amount),
        fineDate: new Date(body.fineDate),
        paid: body.paid === true,
      },
    });

    return NextResponse.json(newFine, { status: 201 });
  } catch (err) {
    console.error('Error creating fine:', err);
    return NextResponse.json(
      { error: 'Failed to save fine.' },
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

    if (typeof body.id !== 'string' || !body.id) {
      return NextResponse.json(
        { error: 'Fine ID is required.' },
        { status: 400 }
      );
    }

    if (!validateFine(body)) {
      return NextResponse.json(
        { error: 'Please provide valid fine details.' },
        { status: 400 }
      );
    }

    const existing = await prisma.fine.findUnique({
      where: { id: body.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Fine not found.' },
        { status: 404 }
      );
    }

    const updatedFine = await prisma.fine.update({
      where: { id: body.id },
      data: {
        vehicleNumber: body.vehicleNumber.trim(),
        driverName:
          typeof body.driverName === 'string' && body.driverName.trim()
            ? body.driverName.trim()
            : 'Unassigned',
        suggestedDriverName:
          typeof body.suggestedDriverName === 'string'
            ? body.suggestedDriverName.trim() || null
            : null,
        driverConfirmed: body.driverConfirmed === true,
        location:
          typeof body.location === 'string'
            ? body.location.trim() || null
            : null,
        violation: body.violation.trim(),
        amount: Number(body.amount),
        fineDate: new Date(body.fineDate),
        paid: body.paid === true,
      },
    });

    return NextResponse.json(updatedFine);
  } catch (err) {
    console.error('Error updating fine:', err);
    return NextResponse.json(
      { error: 'Failed to update fine.' },
      { status: 500 }
    );
  }
}
