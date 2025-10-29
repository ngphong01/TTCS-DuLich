import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { db } from "@/lib/mysql";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10")));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const status = searchParams.get("status") || undefined;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["userId = ?"]; 
    const params: unknown[] = [session.user.id];
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    const where = `WHERE ${conditions.join(" AND ")}`;

    const countRows = await db.executeQuery<{ total: number }>(
      `SELECT COUNT(*) as total FROM transaction ${where}`,
      params
    );
    const total = countRows[0]?.total || 0;

    const rows = await db.executeQuery(
      `SELECT id, bookingId, amount, currency, paymentMethod, status, gatewayTransactionId, createdAt
       FROM transaction
       ${where}
       ORDER BY createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      payments: rows,
      total,
      page,
      pageSize: limit,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("/api/account/payments error", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}


