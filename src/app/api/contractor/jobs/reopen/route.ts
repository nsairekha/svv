import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// POST /api/contractor/jobs/reopen - Reopen a resolved job and mark as reopened
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.role !== 'contractor') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { jobId } = await req.json();
    if (!jobId) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });

    const job = await prisma.report.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Only allow reopen if job is resolved
    if (job.status !== 'resolved') return NextResponse.json({ error: 'Only resolved jobs can be reopened' }, { status: 400 });

    // Reopen: set status to 'reopened' and keep assignedTo as contractor (so it appears in reopened filter)
    const updated = await prisma.report.update({ where: { id: jobId }, data: { status: 'reopened', assignedTo: user.email } });

    // Create a notification
    await prisma.notification.create({ data: { userId: user.id, title: 'Job Reopened', message: `You reopened job #${jobId}`, type: 'info' } });

    return NextResponse.json({ job: updated, message: 'Job reopened' });
  } catch (error: any) {
    console.error('Reopen job error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
