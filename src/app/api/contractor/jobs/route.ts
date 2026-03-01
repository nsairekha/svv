import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// GET /api/contractor/jobs - Get jobs with advanced filtering
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

    // Get contractor profile with location
    const contractor = await prisma.contractor.findUnique({
      where: { userId: user.id }
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build where clause
    let whereClause: any = {};
    
    // Status Filter & Scoping
    if (statusFilter === 'all') {
      // Security/Logic: Only show pending (available to all) OR jobs specifically assigned to this contractor
      whereClause.OR = [
        { status: 'pending', assignedTo: null },
        { assignedTo: user.email }
      ];
    } else if (statusFilter === 'pending') {
      whereClause.status = 'pending';
      whereClause.assignedTo = null;
    } else if (['assigned', 'in-progress', 'resolved', 'reopened'].includes(statusFilter)) {
      whereClause.status = statusFilter.replace('-', '_');
      whereClause.assignedTo = user.email;
    } else {
      // Default to user's own scope if unknown filter
      whereClause.assignedTo = user.email;
    }

    // Search (ID, Type, Description) - Must respect the scope defined above
    if (search) {
      const searchTerms = [
        { id: isNaN(parseInt(search)) ? undefined : parseInt(search) },
        { issueType: { contains: search } },
        { description: { contains: search } }
      ].filter(condition => condition !== undefined);

      if (whereClause.OR) {
        // If we already have a scope-based OR (like for 'all'), we wrap everything
        whereClause = {
          AND: [
            { OR: whereClause.OR },
            { OR: searchTerms }
          ]
        };
      } else {
        // Apply search terms within the specific status scope
        whereClause.AND = [
          { OR: searchTerms }
        ];
      }
    }

    // Category (issueType)
    if (category !== 'all') {
      whereClause.issueType = category;
    }

    // Priority (severity mapping)
    if (priority !== 'all') {
      if (priority === 'high') {
        whereClause.severity = { gte: 0.7 };
      } else if (priority === 'medium') {
        whereClause.severity = { gte: 0.4, lt: 0.7 };
      } else if (priority === 'low') {
        whereClause.severity = { lt: 0.4 };
      }
    }

    // Fetch reports
    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder }
    });

    // Calculate distances and transform
    const jobs = reports.map(report => {
      let distance = 0;
      if (contractor.latitude && contractor.longitude) {
        distance = calculateDistance(
          contractor.latitude,
          contractor.longitude,
          report.lat,
          report.lng
        );
      }

      return {
        id: report.id,
        lat: report.lat,
        lng: report.lng,
        imageUrl: report.imageUrl,
        issueType: report.issueType,
        severity: report.severity,
        description: report.description,
        status: report.status,
        assignedTo: report.assignedTo,
        createdAt: report.createdAt.toISOString(),
        distance: distance,
        userId: report.userId,
        userName: report.user.name,
        userEmail: report.user.email
      };
    });

    // Return all jobs (distance filter removed as per user request to see all reported issues)
    const filteredJobs = jobs;

    return NextResponse.json({
      jobs: filteredJobs,
      contractorLocation: contractor.latitude ? {
        latitude: contractor.latitude,
        longitude: contractor.longitude
      } : null,
      totalCount: filteredJobs.length
    });

  } catch (error: any) {
    console.error('Get contractor jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
