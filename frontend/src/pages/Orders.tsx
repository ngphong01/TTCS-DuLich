import { useEffect, useState } from 'react';
import { BookingAPI, UserAPI } from '../utils/api';

type Order = {
  id: number;
  code?: string;
  status: string;
  totalAmount?: number;
  createdAt?: string;
  destination?: { name: string };
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const current = await UserAPI.current().catch(() => null);
        const userId = (current as any)?.user?.id;
        if (!userId) {
          setOrders([]);
          setError('Bạn cần đăng nhập để xem đơn hàng.');
          return;
        }
        const list = await BookingAPI.byUser(userId).catch(() => []);
        if (!cancelled) setOrders(list as unknown as Order[]);
      } catch (e) {
        if (!cancelled) setError('Không thể tải danh sách đơn hàng.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Đơn hàng của bạn</h1>

      {loading && (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse h-24 rounded-2xl bg-gray-100" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-700">Bạn chưa có đơn hàng nào.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-gray-600 border-b">
            <div className="col-span-3">Mã đơn</div>
            <div className="col-span-3">Điểm đến</div>
            <div className="col-span-2">Trạng thái</div>
            <div className="col-span-2">Tổng</div>
            <div className="col-span-2">Ngày tạo</div>
          </div>
          {orders.map((o) => (
            <div key={o.id} className="grid grid-cols-12 gap-2 px-4 py-4 border-b last:border-0">
              <div className="col-span-3 font-mono text-sm">{o.code || `#${o.id}`}</div>
              <div className="col-span-3 text-sm">{o.destination?.name || '—'}</div>
              <div className="col-span-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${o.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : o.status === 'CANCELED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {o.status}
                </span>
              </div>
              <div className="col-span-2 font-semibold">{(o.totalAmount || 0).toLocaleString('vi-VN')} VNĐ</div>
              <div className="col-span-2 text-sm text-gray-600">{o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


