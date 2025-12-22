import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStories } from '../services/story';
import { BookOpenIcon, CalendarDaysIcon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Skeleton from '../components/Skeleton';
import SEOHead from '../components/SEOHead';

function FeaturedStories() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const limit = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['stories', page, category],
    queryFn: () => getStories(page, limit, undefined, category),
  });

  const categories = ['Experience', 'Customer Story', 'Travel Guide'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <SEOHead
        title="Câu Chuyện Du Lịch - Trải Nghiệm Thực Tế"
        description="Khám phá những câu chuyện du lịch cảm động được AI viết từ trải nghiệm thực tế"
        url="/featured-stories"
      />

      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-semibold mb-6">
              <SparklesIcon className="h-5 w-5" />
              <span>Stories được AI tự động tạo</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              📖 Câu Chuyện Du Lịch
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Những trải nghiệm thực tế và cảm xúc được AI kể lại
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setCategory(undefined)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                !category
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  category === cat
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-2xl" />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.items.map((story: any) => (
                  <div
                    key={story.id}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
                  >
                    <div className="relative h-56 bg-gradient-to-br from-purple-400 to-pink-500 overflow-hidden">
                      {story.image ? (
                        <img
                          src={story.image}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpenIcon className="h-20 w-20 text-white/50" />
                        </div>
                      )}
                      
                      {story.destination && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-900 flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{story.destination.name}</span>
                        </div>
                      )}

                      {story.featured && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                          ⭐ Featured
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {story.title}
                      </h3>
                      
                      {story.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {story.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <CalendarDaysIcon className="h-4 w-4" />
                            <span>{formatDate(story.publishedAt || story.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <EyeIcon className="h-4 w-4" />
                            <span>{story.views || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-red-500">
                          <HeartIconSolid className="h-4 w-4" />
                          <span>{story.likes || 0}</span>
                        </div>
                      </div>

                      {story.author && (
                        <div className="text-sm text-gray-600 mb-4">
                          Bởi <span className="font-semibold">{story.author}</span>
                        </div>
                      )}

                      {story.tags && Array.isArray(story.tags) && story.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {story.tags.slice(0, 3).map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {data.pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-white shadow hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-lg font-semibold ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                    disabled={page === data.pages}
                    className="p-2 rounded-lg bg-white shadow hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpenIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có câu chuyện nào</h3>
              <p className="text-gray-600">AI sẽ tự động tạo featured stories mỗi 5 phút</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FeaturedStories;
