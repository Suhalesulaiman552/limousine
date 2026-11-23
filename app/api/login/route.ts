import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    if (
      typeof name !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        name: name.trim().toLowerCase(),
      },
    });

    if (!user || !user.name || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const role = user.role.toUpperCase();

    if (!['ADMIN', 'DRIVER'].includes(role)) {
      return NextResponse.json(
        { error: 'Account role is not authorized' },
        { status: 403 }
      );
    }

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      role,
    });

    const response = NextResponse.json({
      success: true,
      role,
      name: user.name,
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}