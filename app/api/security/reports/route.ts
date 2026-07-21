// app/api/security/reports/route.ts
import { NextResponse } from 'next/server';
import { WeeklySecurityReportGenerator, TamperProofAuditLogger } from '@/lib/security-audit-report';
import { LevelByLevelSecurityTester } from '@/lib/security-testing';
import { withSecurityFirewall } from '@/lib/security-firewall';

export const GET = withSecurityFirewall(
  async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'weekly_report';

    if (action === 'audit_logs') {
      const logs = TamperProofAuditLogger.getLogs(100);
      const integrity = TamperProofAuditLogger.verifyChainIntegrity();

      return NextResponse.json({
        success: true,
        chainStatus: integrity.isValid ? 'VALID' : 'COMPROMISED',
        logCount: logs.length,
        logs
      });
    }

    if (action === 'run_scan') {
      const scanSummary = await LevelByLevelSecurityTester.runFullSecurityAudit();
      return NextResponse.json({
        success: true,
        scanSummary
      });
    }

    // Default: Weekly Report
    const report = WeeklySecurityReportGenerator.generateWeeklyReport();
    return NextResponse.json({
      success: true,
      report
    });
  },
  { allowedRoles: ['admin'] }
);
