import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  StarIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  HeartIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import AccountSidebar from "../../components/AccountSidebar";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/review', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
        setReviews(list);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === 'all' || review.rating === filter;
    const matchesSearch = !searchTerm || 
      review.destinationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.destination?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: reviews.length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '0.0',
    fiveStar: reviews.filter(r => r.rating === 5).length,
    fourStar: reviews.filter(r => r.rating === 4).length,
    threeStar: reviews.filter(r => r.rating === 3).length,
    twoStar: reviews.filter(r => r.rating === 2).length,
    oneStar: reviews.filter(r => r.rating === 1).length,
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    if (rating >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBadgeColor = (rating: number) => {
    if (rating === 5) return 'bg-green-100 text-green-800 border-green-200';
    if (rating === 4) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (rating === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rating === 2) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 hidden lg:block">
            <AccountSidebar />
          </div>
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600"></div>
                  <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              </div>
          </div>
        </div>
      </main>
      </div>
    );
  }

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
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 px-6 py-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <StarIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Đánh giá của tôi</h1>
                    <p className="text-white/90 mt-1">Xem lại và quản lý các đánh giá bạn đã viết</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tổng đánh giá</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <ChatBubbleLeftIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Đánh giá TB</p>
                    <p className={`text-3xl font-bold mt-1 ${getRatingColor(parseFloat(stats.avgRating))}`}>
                      {stats.avgRating}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <StarIconSolid className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">5 sao</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.fiveStar}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <StarIconSolid className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Điểm đến</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">
                      {new Set(reviews.map(r => r.destinationId || r.destination?.id)).size}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <StarIconSolid className="w-5 h-5 text-yellow-500" />
                  Phân bố đánh giá
                </h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm font-semibold text-gray-700">{star}</span>
                          <StarIconSolid className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              star === 5 ? 'bg-green-500' :
                              star === 4 ? 'bg-blue-500' :
                              star === 3 ? 'bg-yellow-500' :
                              star === 2 ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo điểm đến hoặc nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      filter === 'all'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  {[5, 4, 3, 2, 1].map(star => (
                    <button
                      key={star}
                      onClick={() => setFilter(star)}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                        filter === star
                          ? 'bg-yellow-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {star} <StarIconSolid className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
          </div>

            {/* Reviews List */}
            {(!Array.isArray(reviews) || reviews.length === 0) ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <StarIcon className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có đánh giá nào</h3>
                <p className="text-gray-600 mb-6">Hãy chia sẻ trải nghiệm của bạn về các điểm đến đã ghé thăm</p>
                <Link 
                  to="/destinations" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <MapPinIcon className="w-5 h-5" />
                  Khám phá điểm đến
              </Link>
            </div>
            ) : filteredReviews.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy kết quả</h3>
                <p className="text-gray-600 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button
                  onClick={() => {
                    setFilter('all');
                    setSearchTerm('');
                  }}
                  className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review: any) => (
                  <div key={review.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <StarIconSolid className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <h3 className="font-bold text-lg text-gray-900 truncate">
                                {review.destinationId || review.destination?.name || 'Điểm đến'}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <CalendarIcon className="w-4 h-4" />
                              <span>
                                {review.createdAt 
                                  ? new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })
                                  : 'Ngày không xác định'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Rating Badge */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold ${getRatingBadgeColor(review.rating || 0)}`}>
                          <span className="text-lg">{review.rating || 0}</span>
                          <StarIconSolid className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Stars Display */}
                      <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                          <StarIconSolid
                              key={i}
                            className={`w-5 h-5 ${
                              i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-semibold text-gray-600 ml-2">
                          {review.rating || 0} trên 5 sao
                        </span>
                      </div>

                      {/* Comment */}
                      {review.comment && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-start gap-2">
                            <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
                          <PencilSquareIcon className="w-4 h-4" />
                          Chỉnh sửa
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                          Xóa
                        </button>
                      </div>
                    </div>
                        </div>
                ))}
              </div>
            )}

            {/* Results Count */}
            {filteredReviews.length > 0 && (
              <div className="text-center text-sm text-gray-600">
                Hiển thị <span className="font-semibold text-gray-900">{filteredReviews.length}</span> trong tổng số <span className="font-semibold text-gray-900">{reviews.length}</span> đánh giá
            </div>
          )}
        </div>
      </div>
    </main>
    </div>
  );
}
