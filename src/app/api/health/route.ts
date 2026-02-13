import { NextResponse } from 'next/server';

// Health check endpoint for mobile app to verify backend connectivity
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
