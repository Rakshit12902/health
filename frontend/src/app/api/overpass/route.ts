import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    });
    if (!res.ok) return NextResponse.json({ error: \Overpass API returned \\ }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
