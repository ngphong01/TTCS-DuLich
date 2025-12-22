import { useQuery } from '@tanstack/react-query';
import { getActivePromos } from '../services/promo';
import { TicketIcon, ClockIcon, TagIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Skeleton from '../components/Skeleton';

export default function PromoCodes() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: promos, isLoading } = useQuery({
    queryKey: ['promos', 'active'],
    queryFn: () => getActivePromos(50),
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDiscount = (type: string, value: number) => {
    return type === 'PERCENTAGE' ? `${value}%` : `${value.toLocaleString('vi-VN')} đ`;
  };

  const isExpiringSoon = (validUntil: string) => {
    const daysUntilExpiry = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-20 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activePromos = promos?.filter(p => p.active && !isExpired(p.validUntil)) || [];
  const expiredPromos = promos?.filter(p => isExpired(p.validUntil)) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm mb-4">
            <TicketIcon className="h-5 w-5" />
            <span>Mã giảm giá được AI tự động tạo</span>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            🎁 Mã Giảm Giá Hôm Nay
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nhận ngay mã giảm giá độc quyền được AI tự động tạo mỗi ngày!
          </p>
        </div>

        {/* Active Promo Codes */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TagIcon className="h-8 w-8 text-green-600" />
            Mã đang hoạt động ({activePromos.length})
          </h2>
          
          {activePromos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <TagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">Chưa có mã giảm giá nào</p>
              <p className="text-gray-500 mt-2">AI sẽ tự động tạo mã mới mỗi 5 phút</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePromos.map((promo) => {
                const expiringSoon = isExpiringSoon(promo.validUntil);
                
                return (
                  <div
                    key={promo.id}
                    className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 ${
                      expiringSoon ? 'ring-2 ring-orange-400' : ''
                    }`}
                  >
                    {/* Badge */}
                    <div className="absolute top-4 right-4">
                      {expiringSoon && (
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                          Sắp hết hạn!
                        </span>
                      )}
                    </div>

                    {/* Discount Badge */}
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
                      <div className="text-4xl font-black mb-2">
                        {formatDiscount(promo.discountType, promo.discountValue)}
                      </div>
                      <div className="text-sm opacity-90">GIẢM GIÁ</div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Code */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Mã giảm giá:</span>
                          {copiedCode === promo.code && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircleIcon className="h-4 w-4" />
                              Đã sao chép!
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => copyToClipboard(promo.code)}
                          className="w-full px-4 py-3 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg font-mono font-bold text-lg text-gray-900 hover:bg-blue-50 hover:border-blue-400 transition-all"
                        >
                          {promo.code}
                        </button>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        {promo.minAmount && (
                          <div className="flex items-start gap-2">
                            <TagIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>Đơn tối thiểu: {promo.minAmount.toLocaleString('vi-VN')} đ</span>
                          </div>
                        )}
                        
                        {promo.maxDiscount && (
                          <div className="flex items-start gap-2">
                            <TagIcon className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span>Giảm tối đa: {promo.maxDiscount.toLocaleString('vi-VN')} đ</span>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-2">
                          <ClockIcon className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>
                            {formatDate(promo.validFrom)} - {formatDate(promo.validUntil)}
                          </span>
                        </div>

                        {promo.usageLimit && (
                          <div className="flex items-start gap-2">
                            <TicketIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>
                              Còn {promo.usageLimit - promo.usedCount} / {promo.usageLimit} lượt
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expired Promo Codes */}
        {expiredPromos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-600 mb-6 flex items-center gap-2">
              <XCircleIcon className="h-7 w-7" />
              Mã đã hết hạn ({expiredPromos.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
              {expiredPromos.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-300"
                >
                  <div className="text-2xl font-bold text-gray-600 mb-2">
                    {formatDiscount(promo.discountType, promo.discountValue)}
                  </div>
                  <div className="font-mono font-bold text-gray-600 mb-3">
                    {promo.code}
                  </div>
                  <div className="text-sm text-gray-500">
                    Đã hết hạn: {formatDate(promo.validUntil)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

