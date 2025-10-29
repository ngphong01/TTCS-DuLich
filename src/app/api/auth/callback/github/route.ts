import { NextRequest, NextResponse } from 'next/server';
import { handleGitHubCallback } from '@/lib/oauth-providers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    
    console.log('GitHub OAuth callback received, code:', code ? 'present' : 'missing');
    console.log('Env check:', {
      hasClientId: !!process.env.GITHUB_CLIENT_ID,
      hasClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
      nextauthUrl: process.env.NEXTAUTH_URL
    });

    if (!code) {
      console.error('No code provided');
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    // Handle GitHub OAuth callback using our existing system
    const result = await handleGitHubCallback(code);

    if (result.success) {
      console.log('GitHub OAuth success:', result.user);
      return NextResponse.redirect(new URL('/?success=github&email=' + encodeURIComponent(result.user.email), request.url));
    } else {
      console.error('GitHub OAuth callback error:', result.error);
      return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
    }

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
