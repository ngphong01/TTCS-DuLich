import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { db } from "@/lib/mysql";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get chat history for the current user using MySQL
    const messages = await db.executeQuery(
      `SELECT id, message, response, createdAt 
       FROM chatMessage 
       WHERE userId = ? 
       ORDER BY createdAt DESC 
       LIMIT ${limit} OFFSET ${offset}`,
      [session.user.id]
    );

    return NextResponse.json({ messages });

  } catch (error) {
    console.error("Chat history API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete all chat messages for the current user using MySQL
    await db.executeSingleQuery(
      'DELETE FROM chatMessage WHERE userId = ?',
      [session.user.id]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete chat history API error:", error);
    return NextResponse.json(
      { error: "Failed to delete chat history" },
      { status: 500 }
    );
  }
}
