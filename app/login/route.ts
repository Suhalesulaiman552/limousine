import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid phone number or password.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, role: user.role, name: user.name });
  } catch (error) {
    return NextResponse.json({ error: 'Database error during login.' }, { status: 500 });
  }
}