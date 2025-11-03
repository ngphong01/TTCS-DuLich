import { useState } from "react";

export default function ResetPasswordForm({ token: initialToken = "" }: { token?: string }) {
  const [token, setToken] = useState<string>(initialToken);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    if (!token) {
      setError("Token không hợp lệ.");
      setLoading(false);
      return;
    }
    if (!password || password !== confirm) {
      setError("Mật khẩu không khớp.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Đặt lại mật khẩu thất bại");
      }
      setOk(true);
      setTimeout(() => (window.location.href = "/signin"), 1200);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 max-w-md mx-auto card p-6 animate-soft-pop">
      <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
      <p className="text-sm/6 text-foreground/70 mt-1">Nhập mật khẩu mới cho tài khoản của bạn.</p>

      <form onSubmit={submit} className="mt-4 grid gap-3">
        {!initialToken && (
          <>
            <label className="text-xs font-medium">Token</label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
            />
          </>
        )}

        <label className="text-xs font-medium">Mật khẩu mới</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
        />

        <label className="text-xs font-medium">Xác nhận mật khẩu</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
        />

        <button className="btn btn-primary disabled:opacity-70" disabled={loading || !password || !confirm}>
          {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </button>
        {ok && <p className="text-xs/6 text-green-700">Thành công! Đang chuyển tới trang đăng nhập...</p>}
        {error && <p className="text-xs/6 text-red-600">{error}</p>}
      </form>

      <p className="text-xs/6 mt-4">
        <a href="/signin" className="underline">Quay lại đăng nhập</a>
      </p>
    </div>
  );
}