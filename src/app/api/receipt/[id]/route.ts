import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt #${id}</title></head><body style="font-family: system-ui, sans-serif; padding:16px"><h1>Biên lai thanh toán</h1><p>Mã giao dịch: <strong>#${id}</strong></p><p>Trạng thái: Đã phát hành</p><p>Đây là biên lai minh họa. Tích hợp nội dung chi tiết sau.</p></body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}


