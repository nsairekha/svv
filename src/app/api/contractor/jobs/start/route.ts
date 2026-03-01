import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// POST /api/contractor/jobs/start - Start work on an assigned job
export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Verify user is contractor
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'contractor') {
      return NextResponse.json({ error: 'Unauthorized. Contractor access required.' }, { status: 403 });
    }

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Check if job exists and is assigned to this contractor
    const job = await prisma.report.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'assigned') {
      return NextResponse.json({ error: 'Job is not in assigned state' }, { status: 400 });
    }

    if (job.assignedTo !== user.email) {
      return NextResponse.json({ error: 'Job is not assigned to you' }, { status: 403 });
    }

    // Start working on the job and create notification
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.report.update({
        where: { id: jobId },
        data: {
          status: 'in_progress'
        }
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Work Started',
          message: `You have started work on job #${jobId} (${job.issueType}).`,
          type: 'success'
        }
      });

      return updated;
    });

    return NextResponse.json({
      job: result,
      message: 'Work started successfully'
    });

  } catch (error: any) {
    console.error('Start work error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
