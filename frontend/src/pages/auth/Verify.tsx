import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyPage() {
  const [status, setStatus] = useState<"idle" | "ok" | "error" | "loading">("idle");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleVerify = async () => {
      const token = searchParams.get("token") || "";
      const email = (searchParams.get("email") || "").toLowerCase();
      
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
        setTimeout(() => navigate("/simple-login"), 1500);
      } catch {
        setStatus("error");
      }
    };
    
    handleVerify();
  }, [searchParams, navigate]);

  return (
    <main className="container">
      <div className="mt-16 max-w-md mx-auto card p-6 animate-soft-pop text-center">
        <h1 className="text-2xl font-bold">Xác thực email</h1>
        {status === "loading" && <p className="text-sm/6 text-foreground/70 mt-2">Đang xác thực...</p>}
        {status === "ok" && <p className="text-sm/6 text-green-700 mt-2">Xác thực thành công! Đang chuyển tới đăng nhập...</p>}
        {status === "error" && (
          <p className="text-sm/6 text-red-600 mt-2">
            Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại từ trang "Quên mật khẩu" hoặc đăng ký lại.
          </p>
        )}
      </div>
    </main>
  );
}

