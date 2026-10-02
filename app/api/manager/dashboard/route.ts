import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({ include: { vehicles: true } });
    const trips = await prisma.trip.findMany({ include: { driver: true, vehicle: true }, orderBy: { createdAt: 'desc' } });
    const petrol = await prisma.petrolTransaction.findMany({ include: { driver: true, vehicle: true } });
    const vehicles = await prisma.vehicle.findMany({ include: { driver: true } });

    const totalPetrolAmount = petrol.reduce((acc, p) => acc + p.amount, 0);

    return NextResponse.json({
      success: true,
      data: { drivers, trips, petrol, vehicles, totalPetrolAmount },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch manager dashboard data' }, { status: 500 });
  }
}