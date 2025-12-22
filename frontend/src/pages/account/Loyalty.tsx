import { useEffect, useState } from "react";
import { 
  TrophyIcon,
  SparklesIcon,
  ClockIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import AccountSidebar from "../../components/AccountSidebar";

type Loyalty = { 
  tier: string; 
  points: number; 
  history: { id: string; delta: number; note: string; at: string }[]; 
  benefits?: string[] 
};

export default function LoyaltyPage() {
  const [data, setData] = useState<Loyalty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('tg_token');
    fetch("/api/account/loyalty", {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => r.json())
      .then((d) => !cancelled && setData((d && (d.data ?? d)) as Loyalty))
      .catch(() => !cancelled && setError("Không tải được thông tin thành viên"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const getTierConfig = (tier: string) => {
    const configs: Record<string, { 
      color: string; 
      bgGradient: string; 
      icon: any; 
      nextTier?: string;
      pointsToNext?: number;
    }> = {
      'Bronze': { 
        color: 'from-orange-600 to-amber-700', 
        bgGradient: 'from-orange-50 to-amber-50',
        icon: ShieldCheckIcon,
        nextTier: 'Silver',
        pointsToNext: 1000
      },
      'Silver': { 
        color: 'from-gray-400 to-gray-600', 
        bgGradient: 'from-gray-50 to-slate-50',
        icon: StarIcon,
        nextTier: 'Gold',
        pointsToNext: 2500
      },
      'Gold': { 
        color: 'from-yellow-500 to-amber-600', 
        bgGradient: 'from-yellow-50 to-amber-50',
        icon: TrophyIcon,
        nextTier: 'Platinum',
        pointsToNext: 5000
      },
      'Platinum': { 
        color: 'from-cyan-500 to-blue-600', 
        bgGradient: 'from-cyan-50 to-blue-50',
        icon: SparklesIcon,
        nextTier: 'Diamond',
        pointsToNext: 10000
      },
      'Diamond': { 
        color: 'from-purple-600 to-pink-600', 
        bgGradient: 'from-purple-50 to-pink-50',
        icon: FireIcon
      },
    };
    return configs[tier] || configs['Bronze'];
  };

  const tierConfig = data ? getTierConfig(data.tier) : null;
  const currentPoints = Number((data as any)?.points ?? 0);
  const progressPercentage = tierConfig?.pointsToNext 
    ? Math.min((currentPoints / tierConfig.pointsToNext) * 100, 100)
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <AccountSidebar />
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-600 px-6 py-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <TrophyIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Thành viên & Điểm thưởng</h1>
                    <p className="text-white/90 mt-1">Tích điểm và nhận ưu đãi đặc biệt</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-200 border-t-amber-600"></div>
                  <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrophyIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900 mb-1">Không thể tải dữ liệu</h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            {data && tierConfig && (
              <>
                {/* Tier Card */}
                <div className={`bg-gradient-to-br ${tierConfig.bgGradient} rounded-2xl shadow-2xl border-2 border-white overflow-hidden`}>
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-20 h-20 bg-gradient-to-br ${tierConfig.color} rounded-2xl flex items-center justify-center shadow-xl`}>
                          <tierConfig.icon className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Hạng thành viên</p>
                          <h2 className={`text-4xl font-black bg-gradient-to-r ${tierConfig.color} bg-clip-text text-transparent`}>
                            {data.tier}
                          </h2>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Điểm hiện tại</p>
                        <p className="text-4xl font-black text-gray-900">
                          {currentPoints.toLocaleString("vi-VN")}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">điểm</p>
                      </div>
                    </div>

                    {/* Progress to Next Tier */}
                    {tierConfig.nextTier && tierConfig.pointsToNext && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Tiến độ lên hạng {tierConfig.nextTier}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {currentPoints} / {tierConfig.pointsToNext.toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${tierConfig.color} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${progressPercentage}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Còn <span className="font-bold text-gray-900">{(tierConfig.pointsToNext - currentPoints).toLocaleString("vi-VN")}</span> điểm nữa để lên hạng
                        </p>
                      </div>
                    )}

                    {/* Benefits */}
                    {data.benefits && data.benefits.length > 0 && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/80">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <GiftIcon className="w-5 h-5 text-amber-600" />
                          Quyền lợi của bạn
                        </h3>
                        <div className="grid gap-3">
                          {data.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="text-sm text-gray-700 leading-relaxed">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Redeem Button */}
                    <div className="mt-6">
                      <button 
                        disabled
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all opacity-50 cursor-not-allowed"
                      >
                        <SparklesIcon className="w-5 h-5" />
                        Đổi 500 điểm lấy voucher 50k (Sắp ra mắt)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tổng điểm</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                          {currentPoints.toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <StarIconSolid className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Giao dịch</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                          {data.history?.length || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Hạng</p>
                        <p className={`text-2xl font-bold mt-1 bg-gradient-to-r ${tierConfig.color} bg-clip-text text-transparent`}>
                          {data.tier}
                        </p>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-br ${tierConfig.color} rounded-xl flex items-center justify-center`}>
                        <TrophyIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* History Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-gray-600" />
                      Lịch sử điểm thưởng
                    </h2>
                  </div>

                  <div className="p-6">
                    {(!data.history || data.history.length === 0) ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ClockIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">Chưa có lịch sử giao dịch điểm</p>
                        <p className="text-sm text-gray-500 mt-1">Hoàn thành tour để nhận điểm thưởng</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.history.map((h) => (
                          <div 
                            key={h.id} 
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                h.delta > 0 ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {h.delta > 0 ? (
                                  <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                                ) : (
                                  <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                                  {h.note}
                                </p>
                                {h.at && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(h.at).toLocaleDateString('vi-VN', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className={`text-right flex-shrink-0 ml-4`}>
                              <div className={`text-xl font-bold ${
                                h.delta > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {h.delta > 0 ? "+" : ""}{h.delta}
                              </div>
                              <div className="text-xs text-gray-500">điểm</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tier Benefits Info */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BoltIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Cách tích điểm</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Nhận 10 điểm cho mỗi 100.000đ chi tiêu</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Hoàn thành tour để nhận điểm thưởng</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Giới thiệu bạn bè nhận thêm 500 điểm</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}