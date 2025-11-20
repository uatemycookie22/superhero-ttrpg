import { NextResponse } from 'next/server';
import { now } from '@/lib/temporal';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: now().toString(),
  });
}