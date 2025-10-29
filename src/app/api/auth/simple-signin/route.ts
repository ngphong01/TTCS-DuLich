import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/simple-auth';
import { handleApiError, createRequestContext } from '@/lib/logger';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Validation schema
const SignInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  const context = createRequestContext();
  
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = SignInSchema.parse(body);
    const { email, password } = validatedData;
    
    // Attempt sign in
    console.log('🔐 Sign in request for:', email);
    const result = await signIn(email, password);
    console.log('📊 Sign in result:', result.success ? 'SUCCESS' : 'FAILED', result.error || '');
    
    if (result.success && result.user) {
      // Set session cookie
      const cookieStore = await cookies();
      const sessionToken = `${result.user.id}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      console.log('🍪 Setting session cookie for user:', result.user.email);
      
      cookieStore.set('simple-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
      
      return NextResponse.json({
        success: true,
        message: 'Sign in successful',
        user: result.user,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Sign in failed' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    const sanitized = handleApiError(error, 'POST /api/auth/simple-signin', context);
    return NextResponse.json(
      { error: sanitized.message },
      { status: 500 }
    );
  }
}
