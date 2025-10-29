import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/simple-auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /api/auth/user called');
    
    // Try simple-auth session first (simple-session cookie)
    const session = await getSession();
    
    if (session && session.user) {
      console.log('✅ Simple-auth session found:', session.user.email);
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          picture: session.user.image,
          provider: 'credentials',
          loginTime: new Date().toISOString()
        }
      });
    }
    
    // Fallback to OAuth session (user_session cookie)
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session');
    
    if (userSession) {
      try {
        const userData = JSON.parse(userSession.value);
        console.log('✅ OAuth session found:', userData.email);
        return NextResponse.json({
          authenticated: true,
          user: userData
        });
      } catch (parseError) {
        console.error('❌ Error parsing OAuth session cookie:', parseError);
      }
    }
    
    // No session found
    console.log('❌ No session found');
    return NextResponse.json({
      authenticated: false,
      user: null
    });
    
  } catch (error) {
    console.error('❌ Error retrieving user session:', error);
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Session retrieval failed'
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
    // Clear both session cookies
    response.cookies.set('simple-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('user_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    console.log('🚪 User logged out successfully');
    
    return response;
    
  } catch (error) {
    console.error('❌ Error during logout:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Logout failed' 
    });
  }
}
