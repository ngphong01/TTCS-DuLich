import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { handleApiError, createRequestContext } from '@/lib/logger';

// Get current user session
export async function GET() {
  const context = createRequestContext();
  
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({
        status: 'error',
        message: 'No active session',
        user: null
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'User session found',
      user: session.user,
      expires: session.expires
    });

  } catch (error) {
    const sanitized = handleApiError(error, 'GET /api/auth/session', context);
    return NextResponse.json(
      { 
        status: 'error', 
        error: sanitized.message,
        ...(process.env.NODE_ENV === 'development' && { details: error instanceof Error ? error.message : 'Unknown error' })
      },
      { status: 500 }
    );
  }
}
