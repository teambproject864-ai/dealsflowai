import { NextResponse } from 'next/server';
import { getHermes } from '@/lib/hermes';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const hermes = getHermes();
    
    const memories = await hermes.searchMemories(body);
    return NextResponse.json({ success: true, memories });
  } catch (error) {
    console.error('[Hermes API] Search memories error:', error);
    const message = error instanceof Error ? error.message : 'Failed to search memories';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
