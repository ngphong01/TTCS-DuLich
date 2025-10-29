import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const { subject, message } = body as { subject?: string; message?: string };
    if (!subject || !message) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }
    // For now, just acknowledge; integrate DB or email later
    console.log("Support ticket:", { user: session.user.email, subject, message });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}


