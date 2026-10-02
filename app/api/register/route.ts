import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, password } = body;

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
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message || 'Database error during registration.' }, { status: 500 });
  }
}