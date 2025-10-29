import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice #${id}</title></head><body style="font-family: system-ui, sans-serif; padding:16px"><h1>Hóa đơn</h1><p>Mã đặt chỗ: <strong>#${id}</strong></p><p>Trạng thái: Đã phát hành</p><p>Đây là hóa đơn minh họa. Tích hợp nội dung chi tiết sau.</p></body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}


