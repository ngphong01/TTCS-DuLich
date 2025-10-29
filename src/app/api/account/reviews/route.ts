import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { REVIEWS } from "@/data/reviews";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ reviews: [] });
    }
    const mine = REVIEWS.filter(
      (r) => r.author === session.user?.name || r.author === session.user?.email
    );
    return NextResponse.json({ reviews: mine });
  } catch (e) {
    return NextResponse.json({ reviews: [] });
  }
}


