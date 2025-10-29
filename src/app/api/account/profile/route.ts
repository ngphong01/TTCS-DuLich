import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { db } from "@/lib/mysql";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, image, phone, birthday, gender, country } = body as Record<string, unknown>;

    // Update basic user fields (assuming a `user` table with these columns)
    await db.executeQuery(
      `UPDATE user SET 
        name = COALESCE(?, name),
        image = COALESCE(?, image),
        phone = COALESCE(?, phone),
        birthday = COALESCE(?, birthday),
        gender = COALESCE(?, gender),
        country = COALESCE(?, country)
       WHERE id = ?`,
      [name ?? null, image ?? null, phone ?? null, birthday ?? null, gender ?? null, country ?? null, session.user.id]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/account/profile POST error", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

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
  } catch (error) {
    console.error("/api/account/profile GET error", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}


