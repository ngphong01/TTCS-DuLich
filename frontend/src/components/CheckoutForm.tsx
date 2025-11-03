import { useState } from "react";

export default function CheckoutForm({
  destinationSlug,
  destinationName,
  basePrice,
  guests,
  from,
  to,
}: {
  destinationSlug?: string;
  destinationName?: string;
  basePrice: number;
  guests: number;
  from?: string;
  to?: string;
}) {
  const total = basePrice * guests + 15;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const token = localStorage.getItem('tg_token');
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const res = await fetch("/api/booking", {
        method: "POST",
        headers,
        body: JSON.stringify({
          destination: destinationSlug,
          guests,
          from,
          to,
          name,
          email,
          note: notes,
          price: total,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult({ id: data.id });
      } else {
        setError("Đặt chỗ thất bại. Vui lòng thử lại.");
      }
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const payStripe = async () => {
    if (!result?.id) return;
    
    setPaying(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('tg_token');
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers,
        body: JSON.stringify({ bookingId: result.id, provider: 'stripe' }),
      });
      
      const data = await res.json();
      
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        if (data.error === "Stripe not configured") {
          setError("Hệ thống thanh toán chưa được cấu hình. Vui lòng liên hệ admin.");
        } else {
          setError(`Lỗi thanh toán: ${data.error}`);
        }
      } else {
        setError("Không thể tạo phiên thanh toán. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Không thể kết nối đến hệ thống thanh toán. Vui lòng thử lại.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr]">
      <section className="card p-4">
        <h2 className="font-semibold mb-2">Thông tin hành trình</h2>
        {destinationName ? (
          <div className="text-sm/6">
            <p>Điểm đến: <span className="font-semibold">{destinationName}</span></p>
            <p>Khách: <span className="font-semibold">{guests}</span></p>
            {from && <p>Ngày đi: <span className="font-semibold">{from}</span></p>}
            {to && <p>Ngày về: <span className="font-semibold">{to}</span></p>}
          </div>
        ) : (
          <p className="text-sm/6 text-foreground/70">Chưa chọn điểm đến.</p>
        )}

        <div className="mt-4 grid gap-3">
          <label className="text-xs font-medium">Tên người đặt</label>
          <input
            type="text"
            placeholder="Nguyễn Văn A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          />

          <label className="text-xs font-medium">Email</label>
          <input
            type="email"
            placeholder="ban@vi.du.lich"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
          />

          <label className="text-xs font-medium">Ghi chú</label>
          <textarea
            placeholder="Yêu cầu đặc biệt..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent min-h-[80px]"
          />
        </div>
      </section>

      <aside className="card p-4 h-max">
        <h2 className="font-semibold mb-2">Thanh toán</h2>
        <div className="text-sm/6">
          <p>Giá cơ bản: ${basePrice} x {guests} khách</p>
          <p>Phí dịch vụ: $15</p>
          <p className="font-semibold mt-2">Tổng: ${total}</p>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            className="btn btn-primary disabled:opacity-70"
            onClick={submit}
            disabled={submitting || !name || !email}
          >
            {submitting ? "Đang xử lý..." : "Lưu đặt chỗ"}
          </button>
          {result && (
            <button 
              className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={payStripe}
              disabled={paying}
            >
              {paying ? "Đang xử lý..." : "Thanh toán Stripe"}
            </button>
          )}
        </div>
        {error && <p className="text-xs/6 text-red-600 mt-2">{error}</p>}
        {result && (
          <p className="text-xs/6 text-green-700 mt-2">
            Đặt chỗ đã lưu! Mã đơn: <span className="font-mono">{result.id}</span>
          </p>
        )}
        <p className="text-xs/6 text-foreground/60 mt-2">Thanh toán thực hiện qua Stripe (nếu cấu hình).</p>
      </aside>
    </div>
  );
}