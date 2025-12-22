import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface CaptureResponse {
  success: boolean;
  capture?: Record<string, unknown>;
  paymentId?: number | null;
  bookingId?: number | null;
  error?: string;
  details?: unknown;
}

export default function PayPalSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CaptureResponse | null>(null);

  const token = useMemo(() => searchParams.get("token") || searchParams.get("orderId"), [searchParams]);
  const paymentId = useMemo(() => searchParams.get("paymentId"), [searchParams]);
  const bookingId = useMemo(() => searchParams.get("bookingId"), [searchParams]);

  useEffect(() => {
    const capturePayment = async () => {
      if (!token) {
        setError("Thiếu mã xác thực PayPal (token). Vui lòng kiểm tra lại.");
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const authToken = localStorage.getItem("tg_token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        const res = await fetch("/api/payment/paypal/capture", {
          method: "POST",
          headers,
          body: JSON.stringify({
            orderId: token,
            paymentId,
            bookingId,
          }),
        });

        const data = (await res.json().catch(() => ({}))) as CaptureResponse;

        if (!res.ok || !data.success) {
          setError(
            data?.error ||
              "Không thể xác nhận thanh toán PayPal. Vui lòng liên hệ hỗ trợ."
          );
          setResult(data);
        } else {
          setResult(data);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    capturePayment();
  }, [token, paymentId, bookingId]);

  const handleGoToOrders = () => {
    navigate("/account/bookings");
  };

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-purple-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-3xl border border-gray-100 p-10">
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
            {loading ? (
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : error ? (
              <span className="text-white text-4xl">⚠️</span>
            ) : (
              <span className="text-white text-4xl">✅</span>
            )}
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {loading
              ? "Đang xác nhận thanh toán PayPal..."
              : error
              ? "Thanh toán chưa hoàn tất"
              : "Thanh toán PayPal thành công!"}
          </h1>
          <p className="mt-2 text-gray-600">
            {!loading && !error
              ? "Cảm ơn bạn! Thanh toán đã được xác nhận. Chúng tôi sẽ liên hệ sớm nhất."
              : "Vui lòng kiểm tra thông tin bên dưới hoặc thử lại."}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-left">
            <p className="text-red-700 font-semibold">{error}</p>
            <p className="text-sm text-red-500 mt-1">
              Nếu bạn đã bị trừ tiền, vui lòng liên hệ bộ phận hỗ trợ để được
              trợ giúp nhanh chóng.
            </p>
          </div>
        )}

        {!loading && !error && result?.success && (
          <div className="mb-6 space-y-3 text-left">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Thông tin giao dịch
              </h2>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  <span className="font-medium">Mã PayPal:</span>{" "}
                  {token || "Không xác định"}
                </li>
                {result.paymentId && (
                  <li>
                    <span className="font-medium">Mã thanh toán nội bộ:</span>{" "}
                    #{result.paymentId}
                  </li>
                )}
                {result.bookingId && (
                  <li>
                    <span className="font-medium">Booking của bạn:</span>{" "}
                    #{result.bookingId}
                  </li>
                )}
                <li>
                  <span className="font-medium">Trạng thái PayPal:</span>{" "}
                  {(result.capture as any)?.status || "COMPLETED"}
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleBackHome}
            className="w-full sm:w-1/2 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Về trang chủ
          </button>
          <button
            onClick={handleGoToOrders}
            className="w-full sm:w-1/2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Xem lịch sử đặt chỗ
          </button>
        </div>

        {!loading && (
          <p className="mt-6 text-center text-xs text-gray-500">
            Nếu có thắc mắc về giao dịch, vui lòng liên hệ hỗ trợ khách hàng
            hoặc gửi email đến support@travelgo.vn.
          </p>
        )}
      </div>
    </div>
  );
}

