import { NextResponse } from 'next/server';
import { getHermes } from '@/lib/hermes';

export async function GET() {
  try {
    const hermes = getHermes();
    const metrics = hermes.getMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('[Hermes API] Get metrics error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get metrics';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
