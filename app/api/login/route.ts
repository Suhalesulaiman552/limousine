import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, password } = body;

    if (!name || !password) {
      return NextResponse.json({ error: 'Please enter username and password' }, { status: 400 });
    }

    const trimmedName = name.trim().toLowerCase();

    // Bypass database temporarily if testing instantly, or query Prisma safely
    let role = 'ADMIN';
    let userName = 'suhail';

    try {
      let user = await prisma.user.findFirst({
        where: { name: { equals: trimmedName, mode: 'insensitive' } }
      });

      if (!user && trimmedName === 'suhail' && password === '1234') {
        user = await prisma.user.create({
          data: { name: 'suhail', password: '1234', role: 'ADMIN' },
        });
      }

      if (user) {
        if (user.password !== password) {
          return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
        role = user.role;
        userName = user.name || 'suhail';
      } else if (trimmedName === 'suhail' && password === '1234') {
        // Fallback hardcoded admin success if DB connection fails
        role = 'ADMIN';
        userName = 'suhail';
      } else if (trimmedName === 'mariyam' && password === '1234') {
        role = 'DRIVER';
        userName = 'mariyam';
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } catch (dbError) {
      console.error('Database query failed, using fallback auth:', dbError);
      // Hardcoded fallback if Neon DB connection times out
      if (trimmedName === 'suhail' && password === '1234') {
        role = 'ADMIN';
        userName = 'suhail';
      } else if (trimmedName === 'mariyam' && password === '1234') {
        role = 'DRIVER';
        userName = 'mariyam';
      } else {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }

    const response = NextResponse.json({ success: true, role, name: userName });
    
    response.cookies.set('user_role', role, { path: '/' });
    response.cookies.set('user_name', userName, { path: '/' });

    return response;
  } catch (error) {
    console.error('Critical login routing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}