import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();
    
    // Log CSP violations for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 CSP Violation Report:', JSON.stringify(report, null, 2));
    }
    
    // In production, you might want to send this to a monitoring service
    // like Sentry, LogRocket, or your own analytics
    
    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return NextResponse.json({ error: 'Failed to process report' }, { status: 400 });
  }
}
