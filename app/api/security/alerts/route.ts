// app/api/security/alerts/route.ts
import { NextResponse } from 'next/server';
import { SecurityAlertManager } from '@/lib/security-alerting';
import { withSecurityFirewall } from '@/lib/security-firewall';

export const GET = withSecurityFirewall(
  async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get('severity') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const alerts = SecurityAlertManager.getAlerts({ severity, limit });

    return NextResponse.json({
      success: true,
      count: alerts.length,
      alerts
    });
  },
  { allowedRoles: ['admin', 'agent'] }
);

export const POST = withSecurityFirewall(
  async (req: Request) => {
    try {
      const body = await req.json();
      const { alertId, action, username } = body;

      if (action === 'ACKNOWLEDGE' && alertId) {
        const ackSuccess = SecurityAlertManager.acknowledgeAlert(alertId, username || 'admin');
        return NextResponse.json({
          success: ackSuccess,
          message: ackSuccess ? `Alert ${alertId} acknowledged.` : `Alert ${alertId} not found.`
        });
      }

      return NextResponse.json(
        { success: false, error: 'Invalid action payload' },
        { status: 400 }
      );
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  },
  { allowedRoles: ['admin'] }
);
