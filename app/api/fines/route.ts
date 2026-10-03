import { NextResponse } from 'next/server';

let mockFines: any[] = [
  {
    id: '1',
    vehicleNumber: 'Toyota Camry',
    driverName: 'Ahmed',
    violation: 'Speeding / Radar',
    amount: 600,
    fineDate: new Date().toISOString(),
    paid: false,
  }
];

export async function GET() {
  return NextResponse.json(mockFines);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleNumber, driverName, violation, amount, fineDate, paid } = body;

    // Only require essential fine details (driverName can be auto-assigned or left blank)
    if (!vehicleNumber || !violation || !amount || !fineDate) {
      return NextResponse.json({ error: 'All core fine fields are required.' }, { status: 400 });
    }

    const newFine = {
      id: Date.now().toString(),
      vehicleNumber,
      driverName: driverName || 'Unassigned',
      violation,
      amount: Number(amount),
      fineDate,
      paid: paid ?? false,
    };

    mockFines.unshift(newFine);
    return NextResponse.json(newFine, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process fine.' }, { status: 500 });
  }
}