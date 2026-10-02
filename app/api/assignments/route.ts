import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const assignments = await prisma.vehicleAssignment.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(assignments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicle, driver, date, time } = body;

    if (!vehicle || !driver || !date || !time) {
      return NextResponse.json({ error: 'All assignment fields are required.' }, { status: 400 });
    }

    const newAssignment = await prisma.vehicleAssignment.create({
      data: {
        vehicle,
        driver,
        date,
        time,
      },
    });

    return NextResponse.json({ success: true, assignment: newAssignment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}