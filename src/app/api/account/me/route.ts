import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { db } from "@/lib/mysql";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rows = await db.executeQuery(
      `SELECT id, email, name, image, phone, birthday, gender, country FROM user WHERE id = ? LIMIT 1`,
      [session.user.id]
    );
    return NextResponse.json(rows[0] || {});
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


