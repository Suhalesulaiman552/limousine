import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { driverId, status } = await request.json();
    const updated = await prisma.driver.update({
      where: { id: driverId },
      data: { status },
    });
    return NextResponse.json({ success: true, driver: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}