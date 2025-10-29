import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mysql';
import { hashPassword } from '@/lib/simple-auth';
import { handleApiError, createRequestContext } from '@/lib/logger';
import { z } from 'zod';

// Validation schema
const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  const context = createRequestContext();
  
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = RegisterSchema.parse(body);
    const { name, email, password } = validatedData;
    
    // Check if user already exists
    const existingUser = await db.getUserByEmail(email.toLowerCase().trim());
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    await db.createUser({
      id: userId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: 'user',
      passwordHash,
    });
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      userId,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    const sanitized = handleApiError(error, 'POST /api/auth/simple-register', context);
    return NextResponse.json(
      { error: sanitized.message },
      { status: 500 }
    );
  }
}
