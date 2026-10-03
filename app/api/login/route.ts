import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Please enter a username' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, role: user.role, name: user.name });
    
    response.cookies.set('user_role', user.role, { path: '/' });
    response.cookies.set('user_name', user.name || '', { path: '/' });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}