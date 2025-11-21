import { NextResponse } from 'next/server';
import { getAllWeaknesses } from '@/services/weakness-service';

export async function GET() {
  try {
    const weaknesses = await getAllWeaknesses();
    return NextResponse.json({ weaknesses, count: weaknesses.length });
  } catch (error) {
    console.error('Failed to fetch weaknesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weaknesses' },
      { status: 500 }
    );
  }
}
