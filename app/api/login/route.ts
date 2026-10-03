import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    if (!name || !password) {
      return NextResponse.json({ error: 'Please enter both username and password' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: { name: { equals: trimmedName, mode: 'insensitive' } }
    });

    // Auto-create default user 'suhail' if they don't exist yet for seamless recovery
    if (!user && trimmedName.toLowerCase() === 'suhail') {
      user = await prisma.user.create({
        data: {
          name: 'suhail',
          password: '1234',
          role: 'ADMIN',
        },
      });
    }

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