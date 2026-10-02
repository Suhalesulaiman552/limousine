import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, phone, password } = await request.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json({ error: 'This phone number is already registered.' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        phone,
        password,
        role: 'DRIVER',
      },
    });

    return NextResponse.json({ success: true, role: newUser.role });
  } catch (error) {
    return NextResponse.json({ error: 'Database error during registration.' }, { status: 500 });
  }
}