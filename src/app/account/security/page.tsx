"use client";
import { useState } from "react";

export default function AccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    if (!newPassword || newPassword !== confirm) {
      setError("Mật khẩu mới không khớp.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Đổi mật khẩu thất bại");
      }
      setOk(true);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="mt-16 max-w-md mx-auto card p-6 animate-soft-pop">
        <h1 className="text-2xl font-bold">Bảo mật tài khoản</h1>
        <p className="text-sm/6 text-foreground/70 mt-1">Đổi mật khẩu cho tài khoản của bạn.</p>

        <form onSubmit={submit} className="mt-4 grid gap-3">
          <label className="text-xs font-medium">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          />

          <label className="text-xs font-medium">Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          />

          <label className="text-xs font-medium">Xác nhận mật khẩu</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          />

          <button className="btn btn-primary disabled:opacity-70" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
          {ok && <p className="text-xs/6 text-green-700">Đổi mật khẩu thành công!</p>}
          {error && <p className="text-xs/6 text-red-600">{error}</p>}
        </form>

        <p className="text-xs/6 mt-4">
          <a href="/forgot-password" className="underline">Quên mật khẩu?</a>
        </p>
      </div>
    </main>
  );
}