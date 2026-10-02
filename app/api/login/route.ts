import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid phone number or password.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, role: user.role, name: user.name });
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: error.message || 'Database error during login.' }, { status: 500 });
  }
}