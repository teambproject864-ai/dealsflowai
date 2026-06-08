import { NextResponse } from 'next/server';
import { getProviderSwitchLogs, clearProviderSwitchLogs } from '@/lib/ai-provider-router';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = getProviderSwitchLogs();
    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error('Error fetching provider logs:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch provider logs';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearProviderSwitchLogs();
    return NextResponse.json({
      success: true,
      message: 'Provider switch logs cleared',
    });
  } catch (error) {
    console.error('Error clearing provider logs:', error);
    const message = error instanceof Error ? error.message : 'Failed to clear provider logs';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
