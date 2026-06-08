import { NextResponse } from 'next/server';
import { getIntegratedSystem } from '@/lib/integrated-agent-system';

export async function GET() {
  try {
    const system = getIntegratedSystem();
    const status = system.getSystemStatus();
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('[Integrated System API] Status error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get system status';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
