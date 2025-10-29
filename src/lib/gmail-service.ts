import { readFileSync } from 'fs';
import { join } from 'path';

// Service Account configuration
const SERVICE_ACCOUNT_PATH = join(process.cwd(), 'mineral-subject-454003-c0-0ac6ec892af5.json');
const GMAIL_USER = process.env.GMAIL_USER || 'travelgo@mineral-subject-454003-c0.iam.gserviceaccount.com';

// Dynamic imports to avoid bundling issues
let googleapis: any = null;
let JWT: any = null;

async function loadGooglePackages() {
  if (!googleapis || !JWT) {
    try {
      const [googleapisModule, authModule] = await Promise.all([
        import('googleapis'),
        import('google-auth-library')
      ]);
      googleapis = googleapisModule.google;
      JWT = authModule.JWT;
    } catch (error) {
      console.error('❌ Failed to load Google packages:', error);
      throw error;
    }
  }
  return { googleapis, JWT };
}

// Create JWT client for Service Account
let jwtClient: any = null;

async function getJWTClient(): Promise<any> {
  if (jwtClient) {
    return jwtClient;
  }

  try {
    const { JWT } = await loadGooglePackages();
    const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    
    jwtClient = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });

    await jwtClient.authorize();
    console.log('✅ Gmail Service Account authenticated');
    
    return jwtClient;
  } catch (error) {
    console.error('❌ Failed to authenticate Gmail Service Account:', error);
    throw error;
  }
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Check if service account file exists
    const serviceAccountExists = require('fs').existsSync(SERVICE_ACCOUNT_PATH);
    if (!serviceAccountExists) {
      console.log('❌ Gmail Service Account file not found. Using mock email service.');
      return false;
    }

    const { googleapis } = await loadGooglePackages();
    const auth = await getJWTClient();
    const gmail = googleapis.gmail({ version: 'v1', auth });

    // Create email message
    const message = [
      `To: ${options.to}`,
      `From: ${options.from || GMAIL_USER}`,
      `Subject: ${options.subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      options.html,
    ].join('\n');

    // Encode message in base64
    const encodedMessage = Buffer.from(message).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('✅ Email sent via Gmail Service Account:', result.data.id);
    return true;

  } catch (error) {
    console.error('❌ Failed to send email via Gmail Service Account:', error);
    return false;
  }
}

// Legacy OAuth functions (not needed for Service Account)
export function getGmailAuthUrl(): string {
  return 'Service Account authentication - no auth URL needed';
}

export async function exchangeCodeForTokens(code: string) {
  throw new Error('Service Account authentication - no code exchange needed');
}
