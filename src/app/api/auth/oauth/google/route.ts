import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const redirectUri = 'http://localhost:3000/api/auth/callback/google';
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    console.log('🔗 Redirecting to Google OAuth:', authUrl);
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('💥 OAuth initiation error:', error);
    return NextResponse.redirect(new URL('/auth/error?code=oauth_init_failed', request.url));
  }
}
