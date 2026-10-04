import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch all monthly clients and their attendance records
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthKey = searchParams.get('monthKey') || '2026-10';

    const clients = await prisma.monthlyClient.findMany({
      include: {
        attendance: {
          where: { monthKey },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Failed to fetch monthly clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add new client or toggle attendance
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { name, route, type, vehicle, monthlyFee } = body;
      const newClient = await prisma.monthlyClient.create({
        data: {
          name,
          route,
          type: type || 'Work',
          vehicle: vehicle || 'Toyota Camry',
          monthlyFee: parseFloat(monthlyFee) || 1200,
        },
      });
      return NextResponse.json(newClient);
    }

    if (action === 'attendance') {
      const { clientId, monthKey, day, status } = body;

      if (status === null || status === undefined) {
        await prisma.monthlyAttendance.deleteMany({
          where: { clientId, monthKey, day },
        });
      } else {
        await prisma.monthlyAttendance.upsert({
          where: {
            clientId_monthKey_day: { clientId, monthKey, day },
          },
          update: { status },
          create: { clientId, monthKey, day, status },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to process monthly request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}