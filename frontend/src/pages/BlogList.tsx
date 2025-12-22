import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Skeleton from '../components/Skeleton';
import SEOHead from '../components/SEOHead';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  EyeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

type PageResult = { items: any[]; total: number; page: number; pageSize: number };

export default function BlogList() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const pageSize = 12;

  const { data, isLoading } = useQuery<PageResult>({
    queryKey: ['blog', page, searchTerm, category],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(category && { category }),
      });
      const res = await fetch(`/api/blog?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  const total = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const categories = ['Travel Tips', 'Destinations', 'Reviews', 'News', 'Guides'];

  return (
    <>
      <SEOHead
        title="Blog Du Lịch"
        description="Khám phá những câu chuyện và mẹo du lịch hay nhất từ TravelGo"
        keywords="du lịch, blog, travel tips, điểm đến, mẹo du lịch"
        url={`${window.location.origin}/blog`}
        type="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Blog Du Lịch
          </h1>
          <p className="text-gray-600 text-lg">Khám phá những câu chuyện và mẹo du lịch hay nhất</p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Blog Grid */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && data && (
          <>
            {data.items.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy bài viết nào</h3>
                <p className="text-gray-600">Thử tìm kiếm với từ khóa khác</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data.items.map((blog: any) => (
                  <Link
                    key={blog.id}
                    to={`/blog/${blog.slug}`}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all group"
                  >
                    {blog.featuredImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={blog.featuredImage}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {blog.category && (
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold mb-3">
                          {blog.category}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center gap-2">
                          <EyeIcon className="h-4 w-4" />
                          {blog.views || 0}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Trang {page} / {pageCount}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setPage((p) => (p < pageCount ? p + 1 : p))}
                      disabled={page >= pageCount}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}

