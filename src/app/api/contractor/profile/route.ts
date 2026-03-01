import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// GET /api/contractor/profile - Get contractor's own profile
export async function GET(req: NextRequest) {
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

    // Get contractor profile
    const contractor = await prisma.contractor.findUnique({
      where: { userId: user.id }
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    // Get job stats
    const [
      totalAssigned,
      assignedCount,
      inProgressCount,
      completedCount,
      reopenedCount
    ] = await Promise.all([
      prisma.report.count({ where: { assignedTo: user.email } }),
      prisma.report.count({ where: { assignedTo: user.email, status: 'assigned' } }),
      prisma.report.count({ where: { assignedTo: user.email, status: 'in_progress' } }),
      prisma.report.count({ where: { assignedTo: user.email, status: 'resolved' } }),
      prisma.report.count({ where: { assignedTo: user.email, status: 'reopened' } })
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // For available jobs (pending), count all regardless of distance as per user request
    const [
      availableCount,
      highPriorityCount,
      dueTodayCount
    ] = await Promise.all([
      prisma.report.count({ where: { status: 'pending', assignedTo: null } }),
      prisma.report.count({ where: { status: 'pending', assignedTo: null, severity: { gte: 0.7 } } }),
      prisma.report.count({ where: { status: 'pending', assignedTo: null, createdAt: { gte: todayStart } } })
    ]);

    const stats = {
      totalJobs: totalAssigned,
      assignedJobs: assignedCount,
      pendingJobs: availableCount,
      inProgressJobs: inProgressCount,
      completedJobs: completedCount,
      reopenedJobs: reopenedCount,
      highPriorityJobs: highPriorityCount,
      dueTodayJobs: dueTodayCount
    };

    return NextResponse.json({
      contractor: {
        ...contractor,
        ...stats
      },
      message: 'Profile retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get contractor profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/contractor/profile - Update contractor's own profile
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { name, phone, company, address, city, state, zipCode } = body;

    // Use transaction to update both User and Contractor
    const updatedContractor = await prisma.$transaction(async (tx) => {
      // Update User name
      await tx.user.update({
        where: { id: user.id },
        data: { name }
      });

      // Update Contractor details
      return await tx.contractor.update({
        where: { userId: user.id },
        data: {
          name,
          phone,
          company,
          address,
          city,
          state,
          zipCode
        }
      });
    });

    return NextResponse.json({
      contractor: updatedContractor,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Update contractor profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
