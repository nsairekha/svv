import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// POST /api/admin/reports/assign - Assign a contractor to a report
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { reportId, contractorId } = body || {};
    if (!reportId || !contractorId) {
      return NextResponse.json({ error: 'reportId and contractorId are required' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({ where: { id: parseInt(reportId) } });
    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

    const contractor = await prisma.contractor.findUnique({ where: { id: parseInt(contractorId) } });
    if (!contractor) return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });

    // assign by storing contractor email in assignedTo and update status
    const updated = await prisma.$transaction(async (tx) => {
      const updatedReport = await tx.report.update({
        where: { id: report.id },
        data: { assignedTo: contractor.email, status: 'assigned', updatedAt: new Date() },
      });

      // increment contractor totalJobs and mark unavailable
      const updatedContractor = await tx.contractor.update({
        where: { id: contractor.id },
        data: { totalJobs: { increment: 1 }, isAvailable: false },
      });

      return { updatedReport, updatedContractor };
    });

    return NextResponse.json({ success: true, ...updated, message: 'Contractor assigned to report' });
  } catch (err: any) {
    console.error('Assign report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
