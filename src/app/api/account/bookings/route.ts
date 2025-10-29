import { NextRequest, NextResponse } from "next/server";
import { optimizedQueries } from "@/lib/db-optimization";
import { getSession } from "@/lib/simple-auth";

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

    const data = await optimizedQueries.getUserBookingsOptimized(String(session.user.id), {
      limit,
      offset,
      status,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("/api/account/bookings error", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}


