import { NextResponse } from 'next/server';
import { getClawpatrol } from '@/lib/clawpatrol';

export async function POST(req: Request) {
  try {
    const { agentId, prompt, direction = 'inbound', context } = await req.json();
    const clawpatrol = getClawpatrol();
    
    let result;
    if (direction === 'inbound') {
      result = clawpatrol.inspectInbound(agentId, prompt, context);
    } else {
      result = clawpatrol.inspectOutbound(agentId, prompt, context);
    }
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[Clawpatrol API] Inspect error:', error);
    const message = error instanceof Error ? error.message : 'Failed to inspect';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
