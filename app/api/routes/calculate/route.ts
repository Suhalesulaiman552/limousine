import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { origin, destination } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json({ success: false, error: 'Origin and destination are required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // If no API key is set yet, provide a smart fallback simulation for testing
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        routes: [
          { id: '1', summary: 'via E311 (Fastest)', distanceKm: 142.5, duration: '1 hr 35 mins' },
          { id: '2', summary: 'via E11 Coastal Highway', distanceKm: 158.0, duration: '1 hr 50 mins' },
        ],
      });
    }

    // Call Google Maps Directions API with alternative routes enabled
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&alternatives=true&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json({ success: false, error: `Google Maps error: ${data.status}` }, { status: 400 });
    }

    // Map Google's routes into clean options for your driver
    const routes = data.routes.map((route: any, index: number) => {
      const leg = route.legs[0];
      return {
        id: String(index + 1),
        summary: route.summary || `Route ${index + 1}`,
        distanceKm: Number((leg.distance.value / 1000).toFixed(1)), // convert meters to km
        duration: leg.duration.text,
      };
    });

    return NextResponse.json({ success: true, routes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to calculate route' }, { status: 500 });
  }
}