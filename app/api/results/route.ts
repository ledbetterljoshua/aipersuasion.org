import { getAllResults } from '@/lib/results';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const results = await getAllResults();
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
