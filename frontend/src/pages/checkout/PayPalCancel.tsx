import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PayPalCancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentId = useMemo(() => searchParams.get("paymentId"), [searchParams]);
  const bookingId = useMemo(() => searchParams.get("bookingId"), [searchParams]);

  useEffect(() => {
    const markCancelled = async () => {
      if (!paymentId && !bookingId) {
        return;
      }

      setProcessing(true);
      try {
        const token = localStorage.getItem("tg_token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch("/api/payment/paypal/cancel", {
          method: "POST",
          headers,
          body: JSON.stringify({
            paymentId,
            bookingId,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(
            data?.error ||
              "Không thể cập nhật trạng thái hủy thanh toán. Bạn có thể thử lại sau."
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không thể kết nối đến máy chủ.";
        setError(message);
      } finally {
        setProcessing(false);
      }
    };

    markCancelled();
  }, [paymentId, bookingId]);

  const handleRetry = () => {
    navigate("/checkout");
  };

  const handleChangeMethod = () => {
    navigate("/checkout", { state: { prefer: "domestic" } });
  };

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-red-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full bg-white border border-red-100 shadow-xl rounded-3xl p-10">
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-4xl">✖</span>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Bạn đã hủy thanh toán PayPal
          </h1>
          <p className="mt-2 text-gray-600">
            Đơn hàng của bạn vẫn đang chờ thanh toán. Bạn có thể thử lại PayPal
            hoặc chọn phương thức khác phù hợp hơn.
          </p>
        </div>

        {processing && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
            Đang đồng bộ trạng thái hủy với hệ thống...
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            onClick={handleRetry}
            className="py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Thử lại PayPal
          </button>
          <button
            onClick={handleChangeMethod}
            className="py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Đổi phương thức
          </button>
          <button
            onClick={handleBackHome}
            className="py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Về trang chủ
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Nếu bạn gặp vấn đề trong quá trình thanh toán, hãy liên hệ đội ngũ hỗ
          trợ của TravelGo để được trợ giúp kịp thời.
        </p>
      </div>
    </div>
  );
}

