"use client";
import { useEffect, useState } from "react";

export default function VerifyPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; email?: string }>;
}) {
  const [status, setStatus] = useState<"idle" | "ok" | "error" | "loading">("idle");

  useEffect(() => {
    const handleVerify = async () => {
      if (!searchParams) {
        setStatus("error");
        return;
      }
      
      const params = await searchParams;
      const token = params?.token || "";
      const email = (params?.email || "").toLowerCase();
      
      if (!token || !email) {
        setStatus("error");
        return;
      }
      
      setStatus("loading");
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });
        
        if (!response.ok) throw new Error(await response.text());
        setStatus("ok");
        setTimeout(() => (window.location.href = "/simple-login"), 1500);
      } catch {
        setStatus("error");
      }
    };
    
    handleVerify();
  }, [searchParams]);

  return (
    <main className="container">
      <div className="mt-16 max-w-md mx-auto card p-6 animate-soft-pop text-center">
        <h1 className="text-2xl font-bold">Xác thực email</h1>
        {status === "loading" && <p className="text-sm/6 text-foreground/70 mt-2">Đang xác thực...</p>}
        {status === "ok" && <p className="text-sm/6 text-green-700 mt-2">Xác thực thành công! Đang chuyển tới đăng nhập...</p>}
        {status === "error" && (
          <p className="text-sm/6 text-red-600 mt-2">
            Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại từ trang “Quên mật khẩu” hoặc đăng ký lại.
          </p>
        )}
      </div>
    </main>
  );
}