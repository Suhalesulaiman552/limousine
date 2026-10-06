import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, password } = body;

    if (!name || !password) {
      return NextResponse.json({ error: 'Please enter username and password' }, { status: 400 });
    }

    const trimmedName = name.trim().toLowerCase();

    // Instant check for your login credentials
    if (trimmedName === 'suhail' && password === '1234') {
      const response = NextResponse.json({ success: true, role: 'ADMIN', name: 'suhail' });
      response.cookies.set('user_role', 'ADMIN', { path: '/' });
      response.cookies.set('user_name', 'suhail', { path: '/' });
      return response;
    }

    if (trimmedName === 'mariyam' && password === '1234') {
      const response = NextResponse.json({ success: true, role: 'DRIVER', name: 'mariyam' });
      response.cookies.set('user_role', 'DRIVER', { path: '/' });
      response.cookies.set('user_name', 'mariyam', { path: '/' });
      return response;
    }

    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}