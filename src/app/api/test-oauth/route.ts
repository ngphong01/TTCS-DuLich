import { NextRequest, NextResponse } from 'next/server';
import { getOAuthUrl, handleGoogleCallback, handleGitHubCallback } from '@/lib/oauth-providers';

// Test OAuth URLs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'urls') {
      // Return OAuth URLs for testing
      const googleUrl = getOAuthUrl('google');
      const githubUrl = getOAuthUrl('github');

      return NextResponse.json({
        status: 'success',
        message: 'OAuth URLs generated',
        data: {
          google: googleUrl,
          github: githubUrl,
          environment: {
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
            GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
            GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? '✅ Set' : '❌ Missing',
            GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
          }
        }
      });
    }

    if (action === 'test') {
      // Test OAuth configuration
      const hasGoogleConfig = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
      const hasGithubConfig = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

      return NextResponse.json({
        status: 'success',
        message: 'OAuth configuration test',
        data: {
          google: {
            configured: hasGoogleConfig,
            clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
          },
          github: {
            configured: hasGithubConfig,
            clientId: process.env.GITHUB_CLIENT_ID ? 'Set' : 'Missing',
            clientSecret: process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Missing',
          },
          nextauthUrl: process.env.NEXTAUTH_URL,
          ready: hasGoogleConfig || hasGithubConfig
        }
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'OAuth test API',
      usage: {
        'Get OAuth URLs': '/api/test-oauth?action=urls',
        'Test configuration': '/api/test-oauth?action=test',
        'Google OAuth': '/api/auth/oauth/google',
        'GitHub OAuth': '/api/auth/oauth/github',
      }
    });

  } catch (error) {
    console.error('OAuth test error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: 'OAuth test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Test OAuth callback (for development only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, code } = body;

    if (!provider || !code) {
      return NextResponse.json(
        { error: 'Provider and code required' },
        { status: 400 }
      );
    }

    let result;
    if (provider === 'google') {
      result = await handleGoogleCallback(code);
    } else if (provider === 'github') {
      result = await handleGitHubCallback(code);
    } else {
      return NextResponse.json(
        { error: 'Unsupported provider' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: `${provider} OAuth test completed`,
      result
    });

  } catch (error) {
    console.error('OAuth callback test error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: 'OAuth callback test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
