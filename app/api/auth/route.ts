import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prevent multiple Prisma instances during Next.js hot reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const cleanUsername = username?.trim().toLowerCase();

    // 1. Check if the user is logging in as a manager
    const managers = ['asma', 'suhail', 'shahiba'];
    if (managers.includes(cleanUsername)) {
      if (password === 'manager123') {
        return NextResponse.json({
          success: true,
          role: 'manager',
          username: cleanUsername,
        });
      } else {
        return NextResponse.json({ success: false, error: 'Incorrect manager password' }, { status: 401 });
      }
    }

    // 2. Check if the user is a driver in the database
    const driver = await prisma.driver.findUnique({
      where: { username: cleanUsername },
    });

    if (driver && driver.password === password) {
      return NextResponse.json({
        success: true,
        role: 'driver',
        driverId: driver.id,
        username: driver.username,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}