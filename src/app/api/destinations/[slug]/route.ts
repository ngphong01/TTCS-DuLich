import { NextResponse } from "next/server";
import { DESTINATIONS } from "../../../../data/destinations";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = DESTINATIONS.find((x) => x.slug === slug);
  if (!d) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(d);
}