import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    framework: 'Next.js 16 Full-Stack',
    database: dbService.isMongoActive() ? 'MongoDB Connected' : 'Persistent Database Store Active',
    time: new Date().toISOString()
  });
}
