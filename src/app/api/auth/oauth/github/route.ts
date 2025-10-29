import { NextRequest, NextResponse } from 'next/server';
import { getOAuthUrl } from '@/lib/oauth-providers';

// GitHub OAuth redirect
export async function GET() {
  try {
    const githubUrl = getOAuthUrl('github');
    console.log('Redirecting to GitHub OAuth:', githubUrl);
    
    // Return redirect response manually
    return new Response(null, {
      status: 302,
      headers: {
        Location: githubUrl,
      },
    });
  } catch (error) {
    console.error('GitHub OAuth redirect error:', error);
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/?error=oauth_failed',
      },
    });
  }
}
