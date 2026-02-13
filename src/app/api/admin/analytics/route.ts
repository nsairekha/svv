import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const requestingUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!requestingUser || (requestingUser.role !== 'super_admin' && requestingUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Super admin access required.' }, { status: 403 });
    }

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalReports,
      statusAggregate,
      issueAggregate,
      avgResolutionAggregate,
      recentReports,
      userSnapshot,
      trendReportDates,
      severityValues,
      topContributorsAggregate,
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.report.groupBy({
        by: ['issueType'],
        _count: { _all: true },
      }),
      prisma.report.aggregate({
        _avg: { avgTimeToFix: true },
      }),
      prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          totalPoints: true,
          availablePoints: true,
          isActive: true,
          _count: {
            select: {
              reports: true,
            },
          },
        },
      }),
      prisma.report.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.report.findMany({
        select: { severity: true },
      }),
      prisma.report.groupBy({
        by: ['userId'],
        _count: { _all: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 5,
      }),
    ]);

    const statusCounts = statusAggregate.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item._count._all;
      return acc;
    }, {});

    const issueTypeCounts = issueAggregate.map((item) => ({
      issueType: item.issueType,
      count: item._count._all,
    }));

    const severityDistribution = severityValues.reduce(
      (acc, item) => {
        if (item.severity < 4) {
          acc.low += 1;
        } else if (item.severity < 7) {
          acc.moderate += 1;
        } else if (item.severity < 9) {
          acc.high += 1;
        } else {
          acc.critical += 1;
        }
        return acc;
      },
      { low: 0, moderate: 0, high: 0, critical: 0 }
    );

    const monthlyBuckets: { key: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const bucketDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`;
      const label = bucketDate.toLocaleString(undefined, { month: 'short' });
      const yearSuffix = String(bucketDate.getFullYear()).slice(-2);
      monthlyBuckets.push({ key, label: `${label} '${yearSuffix}`, count: 0 });
    }

    const bucketLookup = new Map(monthlyBuckets.map((bucket, index) => [bucket.key, index]));
    trendReportDates.forEach(({ createdAt }) => {
      const createdKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const bucketIndex = bucketLookup.get(createdKey);
      if (bucketIndex !== undefined) {
        monthlyBuckets[bucketIndex].count += 1;
      }
    });

    const topContributorIds = topContributorsAggregate.map((entry) => entry.userId);
    const contributorDetails = topContributorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: topContributorIds } },
          select: {
            id: true,
            name: true,
            email: true,
            totalPoints: true,
          },
        })
      : [];

    const topContributors = topContributorsAggregate.map((entry) => {
      const details = contributorDetails.find((user) => user.id === entry.userId);
      return {
        userId: entry.userId,
        name: details?.name || 'Unknown Reporter',
        email: details?.email || 'N/A',
        totalPoints: details?.totalPoints ?? 0,
  reportsFiled: entry._count?._all ?? 0,
      };
    });

    const avgResolutionTime = Math.round(avgResolutionAggregate._avg.avgTimeToFix ?? 0);

    const users = userSnapshot.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      totalPoints: user.totalPoints,
      availablePoints: user.availablePoints,
      isActive: user.isActive,
      reportCount: user._count.reports,
    }));

    return NextResponse.json({
      analytics: {
        totals: {
          totalReports,
          pending: statusCounts['pending'] ?? 0,
          inProgress: statusCounts['in_progress'] ?? 0,
          resolved: statusCounts['resolved'] ?? 0,
          other: totalReports - ((statusCounts['pending'] ?? 0) + (statusCounts['in_progress'] ?? 0) + (statusCounts['resolved'] ?? 0)),
          avgResolutionTime,
        },
        statusBreakdown: statusCounts,
        issueTypeCounts,
        severityDistribution,
        monthlyTrend: monthlyBuckets,
        topContributors,
      },
      latestReports: recentReports,
      users,
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
