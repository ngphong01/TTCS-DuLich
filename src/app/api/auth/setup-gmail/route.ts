import { NextRequest, NextResponse } from 'next/server';
import { getGmailAuthUrl, exchangeCodeForTokens } from '@/lib/gmail-service';

// Get Gmail OAuth URL for setup
export async function GET(request: NextRequest) {
  try {
    const authUrl = getGmailAuthUrl();
    
    return NextResponse.json({
      success: true,
      authUrl,
      message: 'Visit this URL to authorize Gmail API access',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate Gmail auth URL' },
      { status: 500 }
    );
  }
}

// Exchange authorization code for tokens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }
    
    const tokens = await exchangeCodeForTokens(code);
    
    return NextResponse.json({
      success: true,
      message: 'Gmail API tokens obtained successfully',
      refreshToken: tokens.refresh_token,
      instructions: 'Add GMAIL_REFRESH_TOKEN to your .env.local file',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to exchange code for tokens' },
      { status: 500 }
    );
  }
}
