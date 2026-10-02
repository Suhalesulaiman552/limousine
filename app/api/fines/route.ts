import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const fines = await prisma.fine.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(fines);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicle, driver, amount, reason } = body;

    if (!vehicle || !driver || amount === undefined || !reason) {
      return NextResponse.json({ error: 'All fine fields are required.' }, { status: 400 });
    }

    const newFine = await prisma.fine.create({
      data: {
        vehicle,
        driver,
        amount,
        reason,
      },
    });

    return NextResponse.json({ success: true, fine: newFine });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}