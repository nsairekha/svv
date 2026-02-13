import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { getTokenFromRequest } from '@/lib/authToken';

// GET /api/points - Get user's points balance and recent history
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
  const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get user basic info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all points transactions for this user
    const allPoints = await prisma.point.findMany({
      where: { userId: decoded.userId },
      select: {
        amount: true,
        type: true,
      }
    });

    // Calculate total points and available points from the points table
    let totalPointsEarned = 0;
    let totalPointsRedeemed = 0;

    allPoints.forEach(point => {
      if (point.amount > 0) {
        // Positive amounts are earned points
        totalPointsEarned += point.amount;
      } else {
        // Negative amounts are redeemed points
        totalPointsRedeemed += Math.abs(point.amount);
      }
    });

    const totalPoints = totalPointsEarned;
    const availablePoints = totalPointsEarned - totalPointsRedeemed;

    // Get recent points history
    const pointsHistory = await prisma.point.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 20, // Last 20 transactions
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        reportId: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        totalPoints: totalPoints,
        availablePoints: availablePoints,
      },
      history: pointsHistory
    });

  } catch (error: any) {
    console.error('Points GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/points - Redeem points
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
  const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { amount, description } = await req.json();

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate current available points from points table
    const allPoints = await prisma.point.findMany({
      where: { userId: decoded.userId },
      select: {
        amount: true,
      }
    });

    let totalPointsEarned = 0;
    let totalPointsRedeemed = 0;

    allPoints.forEach(point => {
      if (point.amount > 0) {
        totalPointsEarned += point.amount;
      } else {
        totalPointsRedeemed += Math.abs(point.amount);
      }
    });

    const availablePoints = totalPointsEarned - totalPointsRedeemed;

    // Check if user has enough points
    if (availablePoints < amount) {
      return NextResponse.json(
        { 
          error: 'Insufficient points', 
          available: availablePoints,
          requested: amount
        }, 
        { status: 400 }
      );
    }

    const { pointTransaction, updatedUser } = await prisma.$transaction(async (tx) => {
      const createdTransaction = await tx.point.create({
        data: {
          userId: decoded.userId,
          type: 'redeemed',
          amount: -amount, // Negative for redemption
          description: description,
        },
      });

      const userTotals = await tx.user.update({
        where: { id: decoded.userId },
        data: {
          availablePoints: { decrement: amount },
        },
        select: {
          totalPoints: true,
          availablePoints: true,
        },
      });

      return {
        pointTransaction: createdTransaction,
        updatedUser: userTotals,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed ${amount} points for ${description}`,
      transaction: pointTransaction,
      newBalance: updatedUser.availablePoints,
      totalPoints: updatedUser.totalPoints,
    });

  } catch (error: any) {
    console.error('Points POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}