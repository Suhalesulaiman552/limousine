import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      orderBy: { assignedDate: 'desc' },
    });
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { driverName, vehicleNumber, assignedDate } = body;

    if (!driverName || !vehicleNumber || !assignedDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        driverName,
        vehicleNumber,
        assignedDate: new Date(assignedDate),
      },
    });

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}