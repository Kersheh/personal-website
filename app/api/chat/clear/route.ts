import { NextResponse } from 'next/server';
import { chatCache } from '../cache';

export async function POST() {
  chatCache.clearMessages();

  return NextResponse.json(
    { success: true },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
