import { NextRequest, NextResponse } from 'next/server';
import { db, testConnection } from '@/lib/mysql';

// Test database connection
export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Simple test queries
    const users = await db.executeQuery<{count: number}>('SELECT COUNT(*) as count FROM user');
    const destinations = await db.executeQuery<{count: number}>('SELECT COUNT(*) as count FROM destination');
    const bookings = await db.executeQuery<{count: number}>('SELECT COUNT(*) as count FROM booking');

    return NextResponse.json({
      status: 'success',
      message: 'MySQL connection working!',
      data: {
        destinations: destinations[0]?.count || 0,
        users: users[0]?.count || 0,
        bookings: bookings[0]?.count || 0,
        connection: 'MySQL working perfectly'
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { error: 'Database error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Create a new destination
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, image, rating, price, country, tags } = body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const id = `dest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const query = `
      INSERT INTO destination (id, slug, name, description, image, rating, price, country, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.executeSingleQuery(query, [
      id, slug, name, description, image, rating, price, country, tags
    ]);

    return NextResponse.json({
      status: 'success',
      message: 'Destination created successfully',
      data: { id, slug, name }
    });

  } catch (error) {
    console.error('Create destination error:', error);
    return NextResponse.json(
      { error: 'Failed to create destination', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
