"use client";
import { useEffect, useState } from "react";

function gravatarUrl(email: string, size = 128) {
  const hash = typeof window !== "undefined" ? window.crypto?.subtle : null;
  // Client: use simple md5 lib? To avoid dependency, fallback to gravatar default
  // We'll let server persist arbitrary image URL; here only preview Gravatar instruction
  return `https://www.gravatar.com/avatar/${encodeURIComponent(email.trim().toLowerCase())}?s=${size}&d=identicon`;
}

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/account/me");
      const d = await res.json();
      setName(d.name || "");
      setImage(d.image || "");
      setEmail(d.email || "");
      setPhone(d.phone || "");
      setBirthday(d.birthday || "");
      setGender(d.gender || "");
      setCountry(d.country || "");
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image, phone, birthday, gender, country }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Cập nhật hồ sơ thất bại");
      }
      setOk(true);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const useGravatar = () => {
    if (!email) return;
    setImage(gravatarUrl(email, 256));
  };

  return (
    <main className="container">
      <div className="mt-16 max-w-md mx-auto card p-6 animate-soft-pop">
        <h1 className="text-2xl font-bold">Cập nhật hồ sơ</h1>
        <p className="text-sm/6 text-foreground/70 mt-1">Đổi tên hiển thị và ảnh đại diện.</p>

        <form onSubmit={submit} className="mt-4 grid gap-3">
          <label className="text-xs font-medium">Tên hiển thị</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          />

          <label className="text-xs font-medium">Ảnh đại diện (URL)</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://.../avatar.png"
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          />
          <div className="flex items-center gap-3">
            <button type="button" className="btn" onClick={useGravatar}>Dùng Gravatar</button>
            {image && <img src={image} alt="avatar" className="h-10 w-10 rounded-full object-cover border" />}
          </div>

          <label className="text-xs font-medium">Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          />

          <label className="text-xs font-medium">Ngày sinh</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          />

          <label className="text-xs font-medium">Giới tính</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          >
            <option value="">Chưa chọn</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>

          <label className="text-xs font-medium">Quốc gia</label>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Vietnam"
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          />

          <button className="btn btn-primary disabled:opacity-70" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          {ok && <p className="text-xs/6 text-green-700">Đã cập nhật hồ sơ!</p>}
          {error && <p className="text-xs/6 text-red-600">{error}</p>}
        </form>

        <p className="text-xs/6 mt-4">
          Mẹo: bạn có thể upload ảnh lên S3 hoặc một dịch vụ lưu trữ và dán URL vào đây.
        </p>
      </div>
    </main>
  );
}