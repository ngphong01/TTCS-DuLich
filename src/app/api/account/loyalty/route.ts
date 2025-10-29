import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ tier: "Bronze", points: 0, history: [] });
    }
    // Simple deterministic example based on user id string length
    const base = String(session.user.id).length * 100;
    const points = Math.min(5000, Math.max(0, base + 800));
    const tier = points >= 3000 ? "Gold" : points >= 1500 ? "Silver" : "Bronze";
    return NextResponse.json({
      tier,
      points,
      history: [],
      benefits: tier === "Gold" ? ["Ưu tiên hỗ trợ", "Voucher đặc biệt"] : tier === "Silver" ? ["Ưu đãi định kỳ"] : ["Tích điểm mỗi giao dịch"],
    });
  } catch (e) {
    return NextResponse.json({ tier: "Bronze", points: 0, history: [] });
  }
}


