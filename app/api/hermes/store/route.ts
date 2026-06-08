import { NextResponse } from 'next/server';
import { getHermes } from '@/lib/hermes';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const hermes = getHermes();
    
    const memory = await hermes.storeMemory(body);
    return NextResponse.json({ success: true, memory });
  } catch (error) {
    console.error('[Hermes API] Store memory error:', error);
    const message = error instanceof Error ? error.message : 'Failed to store memory';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
