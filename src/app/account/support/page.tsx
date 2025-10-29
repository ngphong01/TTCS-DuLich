"use client";
import { useState } from "react";
import Link from "next/link";
import AccountSidebar from "@/components/AccountSidebar";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch("/api/account/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Gửi yêu cầu thất bại");
      }
      setOk(true);
      setSubject("");
      setMessage("");
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <AccountSidebar />
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hỗ trợ</h1>
            <p className="text-sm text-gray-600 mt-1">Gửi yêu cầu hỗ trợ cho chuyến đi</p>
          </div>

      <form onSubmit={submit} className="mt-6 max-w-xl grid gap-3">
        <label className="text-xs font-medium">Chủ đề</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          placeholder="Tôi gặp sự cố với đặt chỗ..."
        />
        <label className="text-xs font-medium">Nội dung</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          placeholder="Mô tả chi tiết sự cố của bạn..."
        />
        <button className="btn btn-primary disabled:opacity-70" disabled={loading || !subject || !message}>
          {loading ? "Đang gửi..." : "Gửi yêu cầu"}
        </button>
        {ok && <div className="text-sm text-green-600">Đã gửi yêu cầu! Chúng tôi sẽ phản hồi qua email.</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </form>
        </div>
      </div>
    </main>
  );
}


