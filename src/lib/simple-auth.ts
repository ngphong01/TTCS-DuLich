/**
 * Simple Authentication System
 * Lightweight authentication thay thế NextAuth
 */

import { db } from './mysql';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
  emailVerified?: boolean;
}

export interface Session {
  user: User;
  expires: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  session?: Session;
}

// Configuration
const COOKIE_NAME = 'simple-session';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

/**
 * Generate simple session token
 */
export function generateSessionToken(user: User): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${user.id}-${timestamp}-${random}`;
}

/**
 * Parse session token
 */
export function parseSessionToken(token: string): { userId: string; timestamp: number } | null {
  try {
    const parts = token.split('-');
    if (parts.length !== 3) return null;
    
    const userId = parts[0];
    const timestamp = parseInt(parts[1]);
    
    // Check if token is expired (7 days)
    if (Date.now() - timestamp > COOKIE_MAX_AGE * 1000) {
      return null;
    }
    
    return { userId, timestamp };
  } catch {
    return null;
  }
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create user session
 */
export async function createSession(user: User): Promise<{ token: string; session: Session }> {
  const token = generateSessionToken(user);
  const expires = new Date(Date.now() + COOKIE_MAX_AGE * 1000);
  
  const session: Session = {
    user,
    expires: expires.toISOString()
  };

  return { token, session };
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    if (!token) return null;
    
    const parsed = parseSessionToken(token);
    if (!parsed) return null;
    
    // Get user from database using MySQL
    const user = await db.getUserById(parsed.userId);
    
    if (!user) return null;
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        image: user.image || undefined,
        role: user.role,
        emailVerified: user.emailVerified || false
      },
      expires: new Date(Date.now() + COOKIE_MAX_AGE * 1000).toISOString()
    };
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

/**
 * Sign in with credentials
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Sign in attempt for:', normalizedEmail);
    
    // Find user using MySQL
    const user = await db.getUserByEmail(normalizedEmail);
    
    if (!user) {
      console.log('❌ User not found:', normalizedEmail);
      return { success: false, error: 'Invalid credentials' };
    }
    
    if (!user.passwordHash) {
      console.log('❌ User has no password hash');
      return { success: false, error: 'Invalid credentials' };
    }
    
    console.log('✅ User found:', user.email, 'Role:', user.role);
    
    // Check password
    const isValid = await comparePassword(password, user.passwordHash);
    console.log('🔐 Password check result:', isValid ? 'VALID' : 'INVALID');
    
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Create session
    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      image: user.image || undefined,
      role: user.role,
      emailVerified: user.emailVerified || false
    };
    
    const { token, session } = await createSession(userData);
    console.log('✅ Session created successfully for:', userData.email);
    
    return { success: true, user: userData, session };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
    return { success: false, error: errorMessage };
  }
}


/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  // Session cleanup is handled by cookie removal
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, data: Partial<User>): Promise<AuthResult> {
  try {
    // Update user using MySQL
    await db.executeSingleQuery(
      'UPDATE user SET name = ?, image = ? WHERE id = ?',
      [data.name, data.image, userId]
    );
    
    // Get updated user
    const user = await db.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      image: user.image || undefined,
      role: user.role,
      emailVerified: user.emailVerified || false
    };
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Update failed' };
  }
}

/**
 * Change password
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
  try {
    const user = await db.getUserById(userId);
    
    if (!user || !user.passwordHash) {
      return { success: false, error: 'User not found' };
    }
    
    // Verify current password
    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update password using MySQL
    await db.executeSingleQuery(
      'UPDATE user SET passwordHash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Change password failed' };
  }
}
