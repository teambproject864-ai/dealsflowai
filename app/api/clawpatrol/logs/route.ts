import { NextResponse } from 'next/server';
import { getClawpatrol } from '@/lib/clawpatrol';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId') || undefined;
    const type = searchParams.get('type') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    
    const clawpatrol = getClawpatrol();
    const logs = clawpatrol.getAuditLogs({ agentId, type, severity, limit });
    
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('[Clawpatrol API] Get logs error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get logs';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const clawpatrol = getClawpatrol();
    clawpatrol['auditLogger'].clearLogs();
    return NextResponse.json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    console.error('[Clawpatrol API] Clear logs error:', error);
    const message = error instanceof Error ? error.message : 'Failed to clear logs';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
