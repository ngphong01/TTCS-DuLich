import { NextRequest, NextResponse } from 'next/server';

async function handleGoogleOAuth(code: string) {
  try {
    console.log('🔄 Starting Google OAuth flow...');
    
    const redirectUri = 'http://localhost:3000/api/auth/callback/google';
    
    console.log('🔍 Environment Check:', {
      clientId: process.env.GOOGLE_CLIENT_ID ? `present (${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...)` : 'missing',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? `present (${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...)` : 'missing',
      redirectUri: redirectUri,
      codeLength: code.length
    });

    // Token exchange request
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    console.log('📨 Token Response:', {
      status: tokenResponse.status,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      error: tokenData.error || 'none'
    });

    if (!tokenResponse.ok) {
      console.error('❌ Token exchange failed - Details:', {
        error: tokenData.error,
        description: tokenData.error_description,
        fullResponse: tokenData
      });
      throw new Error(`Token exchange failed: ${tokenData.error} - ${tokenData.error_description}`);
    }

    console.log('✅ Token exchange successful');

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user info: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    
    console.log('👤 User Profile Received:', {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      verified: userData.verified_email
    });

    return {
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token
      }
    };

  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 OAuth Callback Triggered:', {
      code: request.nextUrl.searchParams.get('code') ? 'present (73 chars)' : 'none',
      error: request.nextUrl.searchParams.get('error') || 'none',
      state: request.nextUrl.searchParams.get('state') || 'none',
      fullUrl: request.url
    });

    const code = request.nextUrl.searchParams.get('code');
    const error = request.nextUrl.searchParams.get('error');

    if (error) {
      console.error('❌ OAuth error:', error);
      return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
    }

    if (!code) {
      console.error('❌ No authorization code received');
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    console.log('🔄 Processing Google OAuth flow...');

    const oauthResult = await handleGoogleOAuth(code);

    if (oauthResult.success && oauthResult.user) {
      console.log('🎉 Google OAuth completed successfully!');
      
      // Create session or store user data (implement your session logic here)
      // For now, we'll redirect with user data in URL params
      
      // Redirect directly to homepage after successful OAuth
      console.log('📍 Redirecting to homepage after successful OAuth');
      
      // Set session cookie for user authentication
      const response = NextResponse.redirect(new URL('/', request.url));
      
      // Set secure httpOnly cookie with user session
      response.cookies.set('user_session', JSON.stringify({
        id: oauthResult.user.id,
        email: oauthResult.user.email,
        name: oauthResult.user.name,
        picture: oauthResult.user.picture,
        provider: 'google',
        loginTime: new Date().toISOString()
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
        // domain: '127.0.0.1', // Fix domain mismatch
      });
      
      console.log('🍪 User session cookie set');
      
      return response;
      
    } else {
      console.error('❌ Google OAuth failed:', oauthResult.error);
      return NextResponse.redirect(new URL(`/?error=oauth_failed`, request.url));
    }

  } catch (error) {
    console.error('💥 Unhandled callback error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
