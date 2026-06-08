import { NextResponse } from 'next/server';
import { getIntegratedSystem } from '@/lib/integrated-agent-system';

export async function POST(req: Request) {
  try {
    const { agentId, prompt, context } = await req.json();
    const system = getIntegratedSystem();
    
    const result = await system.processRequest({ agentId, prompt, context });
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[Integrated System API] Process error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
