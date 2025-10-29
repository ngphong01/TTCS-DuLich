type Provider = 'google' | 'github';

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

export function getOAuthUrl(provider: Provider): string {
  const baseUrl = getBaseUrl();
  const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // github
  const githubClientId = process.env.GITHUB_CLIENT_ID || '';
  const ghParams = new URLSearchParams({
    client_id: githubClientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
  });
  return `https://github.com/login/oauth/authorize?${ghParams.toString()}`;
}

// Optional callback helpers (stubs to avoid import errors in tests)
export async function handleGoogleCallback(code: string) {
  return { ok: !!code };
}

export async function handleGitHubCallback(code: string) {
  return { ok: !!code };
}


