import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mysql';
import { hashPassword } from '@/lib/simple-auth';
import { handleApiError, createRequestContext } from '@/lib/logger';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { render } from '@react-email/render';
import ResetPasswordEmail from '@/emails/ResetPasswordEmail';
import { sendEmail } from '@/lib/gmail-service';

// Validation schema
const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Store reset tokens temporarily (in production, use Redis)
const resetTokens = new Map<string, { email: string; expires: number }>();

// Clean expired tokens
function cleanExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (data.expires < now) {
      resetTokens.delete(token);
    }
  }
}

// Generate reset token
function generateResetToken(email: string): string {
  cleanExpiredTokens();
  const token = randomBytes(32).toString('hex');
  const expires = Date.now() + 15 * 60 * 1000; // 15 minutes
  
  resetTokens.set(token, { email, expires });
  return token;
}

// Validate reset token
function validateResetToken(token: string): string | null {
  cleanExpiredTokens();
  const data = resetTokens.get(token);
  
  if (!data || data.expires < Date.now()) {
    resetTokens.delete(token);
    return null;
  }
  
  return data.email;
}

// Forgot password - send reset email
export async function POST(request: NextRequest) {
  const context = createRequestContext();
  
  try {
    const body = await request.json();
    const validatedData = ForgotPasswordSchema.parse(body);
    const { email } = validatedData;
    
    // Check if user exists
    const user = await db.getUserByEmail(email.toLowerCase().trim());
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a reset link has been sent.',
      });
    }
    
    // Generate reset token
    const resetToken = generateResetToken(email.toLowerCase().trim());
    
    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // Generate email HTML
    const emailHtml = render(ResetPasswordEmail({
      resetUrl,
      userEmail: email,
    }));
    
    // Try to send email via Gmail API, fallback to mock
    const emailSent = await sendEmail({
      to: email,
      subject: 'Reset your password - TravelGo',
      html: emailHtml,
      from: 'noreply@travelgo.com',
    });

    if (!emailSent) {
      // Fallback to mock email service for development
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 MOCK EMAIL SENT:');
        console.log(`   To: ${email}`);
        console.log(`   Subject: Reset your password - TravelGo`);
        console.log(`   Reset Link: ${resetUrl}`);
        console.log('   📝 Copy this link and paste in browser to reset password');
        console.log('   ⏰ Token expires in 15 minutes');
      }
    }
    
    // TODO: Send actual email using your email service (Resend, SendGrid, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'noreply@travelgo.com',
    //   to: email,
    //   subject: 'Reset your password - TravelGo',
    //   html: emailHtml,
    // });
    
    return NextResponse.json({
      success: true,
      message: 'If the email exists, a reset link has been sent.',
      // Only include resetUrl in development
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    const sanitized = handleApiError(error, 'POST /api/auth/forgot-password', context);
    return NextResponse.json(
      { error: sanitized.message },
      { status: 500 }
    );
  }
}

// Reset password - validate token and update password
export async function PUT(request: NextRequest) {
  const context = createRequestContext();
  
  try {
    const body = await request.json();
    const validatedData = ResetPasswordSchema.parse(body);
    const { token, password } = validatedData;
    
    // Validate reset token
    const email = validateResetToken(token);
    if (!email) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    // Get user
    const user = await db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Hash new password
    const passwordHash = await hashPassword(password);
    
    // Update password in database
    await db.executeSingleQuery(
      'UPDATE user SET passwordHash = ? WHERE id = ?',
      [passwordHash, user.id]
    );
    
    // Remove used token
    resetTokens.delete(token);
    
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    const sanitized = handleApiError(error, 'PUT /api/auth/reset-password', context);
    return NextResponse.json(
      { error: sanitized.message },
      { status: 500 }
    );
  }
}
