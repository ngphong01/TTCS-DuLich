import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentAPI, UserAPI, BookingAPI } from '../../utils/api';
import { getDestinationBySlug } from '../../services/destination';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('credit_card');
  const [guests, setGuests] = useState<number>(1);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [destinationId, setDestinationId] = useState<number | null>(null);
  const [description, setDescription] = useState('Thanh toán đơn hàng TravelGo');
  const [transferNote, setTransferNote] = useState(() => {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 12);
    return `TRAVELGO-${ts}-${rand}`;
  });
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const [destinationSlug, setDestinationSlug] = useState<string | null>(null);
  const [destinationName, setDestinationName] = useState<string | null>(null);

  // Prefill from query: ?amount=... or ?slug=...&guests=...
  useEffect(() => {
    const qAmount = searchParams.get('amount');
    const slug = searchParams.get('slug') || searchParams.get('destination');
    const qGuests = Number(searchParams.get('guests') || '1');
    const qMethod = searchParams.get('method');
    if (qMethod) setMethod(qMethod);
    setGuests(Math.max(1, qGuests));
    if (qAmount) {
      setAmount(qAmount);
      return;
    }
    if (slug) {
      setDestinationSlug(slug);
      getDestinationBySlug(slug)
        .then((dest) => {
          const price = Number(dest?.price || 0);
          setDestinationId((dest as any)?.id ?? null);
          setDestinationName((dest as any)?.name ?? null);
          setBasePrice(price);
          if (price > 0) {
            setAmount(String(price * Math.max(1, qGuests)));
            setDescription(`Thanh toán tour: ${dest.name}`);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const formattedVnd = useMemo(() =>
    Number(amount || 0).toLocaleString('vi-VN'), [amount]
  );
  const qr = useMemo(() => {
    const amountNumber = Number(amount || 0);
    const bank = (process.env.REACT_APP_VIETQR_BANK as string | undefined) || 'tpbank';
    const account = (process.env.REACT_APP_VIETQR_ACCOUNT as string | undefined) || '77601112004';
    const accountName = (process.env.REACT_APP_VIETQR_NAME as string | undefined) || 'DAO VAN PHONG';
    const addInfo = transferNote;

    const vietqrUrl = bank && account
      ? `https://img.vietqr.io/image/${bank}-${account}-compact2.jpg?amount=${amountNumber}&addInfo=${encodeURIComponent(addInfo)}${accountName ? `&accountName=${encodeURIComponent(accountName)}` : ''}`
      : null;

    const text = `Thanh toan TravelGo\nSo tien: ${formattedVnd} VND\nNoi dung: ${transferNote}`;
    const generic = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    const fallback = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(text)}`;

    return {
      primary: vietqrUrl || generic,
      fallback,
    };
  }, [amount, formattedVnd, transferNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Optional: create a booking first (demo values)
    try {
      setErrorMsg(null);
      setSubmitting(true);
      if (!amount || Number(amount) <= 0) {
        throw new Error('Vui lòng nhập số tiền hợp lệ.');
      }
      if (!destinationId) {
        throw new Error('Vui lòng mở một điểm đến và bấm "Đặt ngay" để tới trang thanh toán.');
      }
      const token = localStorage.getItem('tg_token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để tạo đơn và thanh toán.');
      }
      const current = await UserAPI.current();
      const userId = (current as any)?.user?.id;
      if (!userId) throw new Error('Vui lòng đăng nhập để tạo đơn và thanh toán.');
      const bookingPayload = {
        destination: destinationSlug,
        destinationName: destinationName || undefined,
        guests,
        // lấy từ tài khoản hiện tại
        name: (current as any)?.user?.name || 'Khách hàng',
        email: (current as any)?.user?.email,
        price: Number(amount),
        totalAmount: Number(amount),
        paymentMethod: method === 'bank_qr' ? 'bank_transfer' : method,
      };
      const booking = await BookingAPI.create(bookingPayload as any);
      const bookingId = (booking as any)?.id || (booking as any)?.booking?.id;
      if (!bookingId) {
        throw new Error('Không thể tạo đơn (thiếu mã đơn).');
      }
      await PaymentAPI.create({ bookingId, provider: method, amount: Number(amount), note: `${description} | REF:${transferNote}` });
      // thông báo để trang Payments có thể tự refetch khi quay về
      window.dispatchEvent(new Event('payment-created'));
    } catch (err: any) {
      // Nếu không tạo được booking (khách chưa đăng nhập), hiển thị lỗi rõ ràng
      setErrorMsg(err?.message || 'Không thể tạo đơn/thanh toán.');
      setSubmitting(false);
      return;
    }
    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => navigate('/account/payments'), 800);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-900">Thanh toán đơn hàng</h2>
          <p className="text-sm text-gray-600 mt-1">Điền thông tin và xác nhận thanh toán</p>
        </div>
        {success && <div className="px-6 py-3 text-green-700 bg-green-50 border-b border-green-100">Thanh toán thành công!</div>}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Số tiền (VNĐ)</label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Số tiền (VNĐ)"
              type="number"
              value={amount}
              onChange={e=>{ if (basePrice <= 0) setAmount(e.target.value); }}
              readOnly={basePrice > 0}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              Tổng: <span className="font-semibold">{formattedVnd} VNĐ</span>
              {basePrice > 0 && <span className="ml-2 text-gray-400">(tự tính = giá tour × số khách)</span>}
            </div>
          </div>

          {/* Guests control when có slug */}
          {basePrice > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số khách</label>
              <div className="inline-flex items-center gap-2">
                <button type="button" onClick={()=>{ const g = Math.max(1, guests-1); setGuests(g); setAmount(String(basePrice * g)); }} className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200">-</button>
                <input
                  type="number"
                  min={1}
                  value={guests}
                  onChange={(e)=>{ const g = Math.max(1, Number(e.target.value||1)); setGuests(g); setAmount(String(basePrice * g)); }}
                  className="w-20 text-center px-3 py-2 rounded-lg border border-gray-300"
                />
                <button type="button" onClick={()=>{ const g = guests+1; setGuests(g); setAmount(String(basePrice * g)); }} className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200">+</button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Giá cơ bản: {basePrice.toLocaleString('vi-VN')} VNĐ/người</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phương thức</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={method}
              onChange={e=>setMethod(e.target.value)}
            >
              <option value="credit_card">Thẻ tín dụng/ghi nợ</option>
              <option value="paypal">PayPal</option>
              <option value="bank_qr">Chuyển khoản (VietQR)</option>
            </select>
          </div>

          {method === 'bank_qr' && (
            <div className="border rounded-xl p-4 bg-gray-50">
              <p className="text-sm mb-2">Quét mã VietQR để thanh toán:</p>
              <div className="flex justify-center">
                <img
                  src={qr.primary}
                  alt="VietQR"
                  className="max-h-80 rounded shadow bg-white"
                  onError={(e)=>{ (e.target as HTMLImageElement).src = qr.fallback; }}
                />
              </div>
              <div className="mt-3 text-sm">
                <label className="block font-medium mb-1">Mô tả thanh toán</label>
                <input className="border px-3 py-2 w-full rounded" value={description} onChange={e=>setDescription(e.target.value)} />
              </div>
              <div className="mt-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Nội dung CK (ghi chú):</span>
                  <button type="button" className="text-blue-600 text-xs" onClick={async()=>{
                    try {
                      await navigator.clipboard.writeText(transferNote);
                      setCopied(true);
                      setTimeout(()=>setCopied(false), 1200);
                    } catch {}
                  }}>Copy</button>
                </div>
                <div className="mt-1 font-mono text-xs bg-white border rounded px-2 py-1 flex items-center justify-between">
                  <span className="truncate">{transferNote}</span>
                  {copied && <span className="ml-2 text-green-600 text-[10px]">Đã copy</span>}
                </div>
              </div>
              <div className="mt-3 text-sm">
                <span className="font-medium">Số tiền cần chuyển:</span>
                <span className="ml-2 font-semibold">{formattedVnd} VNĐ</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">Ghi đúng nội dung chuyển khoản và số tiền để tự động đối soát. Sau khi chuyển khoản thành công, nhấn “Thanh toán” để xác nhận.</p>
            </div>
          )}

          {errorMsg && (
            <div className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2 text-sm">
              {errorMsg}
            </div>
          )}
          <button
            disabled={submitting || !amount || Number(amount) <= 0}
            className={`px-6 py-3 rounded-xl w-full font-semibold text-white shadow ${(!amount || Number(amount) <= 0 || submitting) ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95'}`}
          >
            {submitting ? 'Đang xử lý…' : 'Thanh toán'}
          </button>
        </form>
        <div className="px-6 pb-6">
          <Link to="/account/payments" className="text-blue-600 hover:underline text-sm">Xem lịch sử thanh toán</Link>
        </div>
      </div>
    </div>
  );
}