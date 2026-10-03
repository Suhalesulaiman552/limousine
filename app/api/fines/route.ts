import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const fines = await prisma.fine.findMany({
      orderBy: { fineDate: 'desc' },
    });
    return NextResponse.json(fines);
  } catch (err) {
    console.error('Error fetching fines:', err);
    return NextResponse.json({ error: 'Failed to fetch fines from database.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleNumber, driverName, violation, amount, fineDate, paid } = body;

    if (!vehicleNumber || !violation || !amount || !fineDate) {
      return NextResponse.json({ error: 'All core fine fields are required.' }, { status: 400 });
    }

    const newFine = await prisma.fine.create({
      data: {
        vehicleNumber,
        driverName: driverName || 'Unassigned',
        violation,
        amount: Number(amount),
        fineDate: new Date(fineDate),
        paid: paid ?? false,
      },
    });

    return NextResponse.json(newFine, { status: 201 });
  } catch (err) {
    console.error('Error creating fine:', err);
    return NextResponse.json({ error: 'Failed to save fine to database.' }, { status: 500 });
  }
}