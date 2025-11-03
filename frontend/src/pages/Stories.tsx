import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFeaturedReviews } from '../services/review';
import Skeleton from '../components/Skeleton';
import {
  BookOpenIcon,
  CameraIcon,
  VideoCameraIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  ArrowRightIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';

type StoryType = 'experience' | 'customer' | 'review' | 'guide' | 'blog';

export default function Stories() {
  const [activeTab, setActiveTab] = useState<StoryType>('experience');
  const [selectedStory, setSelectedStory] = useState<number | null>(null);

  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', 'featured'],
    queryFn: () => getFeaturedReviews(20),
  });

  // Mock data - Trải nghiệm du lịch thật
  const experiences = [
    {
      id: 1,
      title: 'Hành trình một mình ở Đà Lạt',
      author: 'Olivia Chen',
      avatar: '👤',
      date: '20/01/2025',
      category: 'Trải nghiệm',
      image: '🏔️',
      imageUrl: '/uploads/destinations/Tour-Da-Lat-3-Ngay-2-Dem.png',
      content: 'Chuyến đi Đà Lạt một mình đã thay đổi hoàn toàn cách nhìn của tôi về du lịch...',
      likes: 1425,
      views: 1200,
      tags: ['Đà Lạt', 'Du lịch một mình', 'Thiên nhiên'],
    },
    {
      id: 2,
      title: 'Chuyến đi cuối cùng cùng người ấy',
      author: 'Liam Martinez',
      avatar: '👤',
      date: '18/01/2025',
      category: 'Trải nghiệm',
      image: '💑',
      imageUrl: '/uploads/destinations/Hội An - Đà Nẵng.jpg',
      content: 'Một hành trình đầy cảm xúc tại Phú Quốc, nơi chúng tôi tạo ra những kỷ niệm cuối cùng...',
      likes: 2380,
      views: 2800,
      tags: ['Phú Quốc', 'Cảm xúc', 'Kỷ niệm'],
    },
    {
      id: 3,
      title: 'Khám phá Sapa vào mùa lúa chín',
      author: 'Sofia Ivanova',
      avatar: '👤',
      date: '15/01/2025',
      category: 'Trải nghiệm',
      image: '🌾',
      imageUrl: '/uploads/destinations/Sapa Trekking 2N1Đ.jpg',
      content: 'Sapa vào mùa lúa chín là một khung cảnh tuyệt vời mà mọi người nên được trải nghiệm ít nhất một lần...',
      likes: 1530,
      views: 950,
      tags: ['Sapa', 'Mùa lúa chín', 'Trekking'],
    },
  ];

  // Câu chuyện khách hàng
  const customerStories = [
    {
      id: 1,
      title: 'Hình ảnh & video review thật từ hành trình Đà Nẵng',
      author: 'TravelGo Stories',
      avatar: '📷',
      date: '22/01/2025',
      category: 'Review',
      images: ['📸', '📸', '📸', '📸'],
      imageUrl: '/uploads/destinations/Combo Hà Nội - Hạ Long.jpg',
      videos: ['🎬'],
      likes: 1856,
      views: 4500,
    },
    {
      id: 2,
      title: 'Cảm xúc sau tour Hội An 3 ngày',
      author: 'Noah Schmidt',
      avatar: '👤',
      date: '19/01/2025',
      category: 'Chia sẻ',
      image: '🏮',
      imageUrl: '/uploads/destinations/Hội An - Đà Nẵng.jpg',
      content: 'Tour Hội An của TravelGo đã vượt quá mong đợi của chúng tôi. Đội ngũ hướng dẫn viên chuyên nghiệp, lịch trình hợp lý...',
      likes: 1408,
      views: 2100,
    },
  ];

  // Cẩm nang du lịch
  const guides = [
    {
      id: 1,
      title: 'Mẹo vặt du lịch: Visa, hành lý, thời tiết, tiền tệ',
      author: 'Emma Dubois',
      avatar: '📚',
      date: '25/01/2025',
      category: 'Cẩm nang',
      image: '✈️',
      imageUrl: '/uploads/destinations/combo-ve-may-bay-va-khach-san.jpg',
      content: 'Những mẹo hữu ích để bạn chuẩn bị tốt nhất cho chuyến đi...',
      checklist: [
        'Kiểm tra visa trước 30 ngày',
        'Chuẩn bị hành lý theo quy định',
        'Theo dõi thời tiết điểm đến',
        'Đổi tiền trước khi đi',
      ],
      views: 3200,
    },
    {
      id: 2,
      title: 'Hướng dẫn săn vé rẻ / đặt phòng / chọn tour',
      author: 'TravelGo Team',
      avatar: '📚',
      date: '23/01/2025',
      category: 'Cẩm nang',
      image: '🎯',
      imageUrl: '/uploads/destinations/Nha Trang 3N2Đ.jpg',
      content: 'Bí kíp để có được giá tốt nhất cho chuyến đi của bạn...',
      checklist: [
        'Đặt vé sớm 2-3 tháng',
        'So sánh giá trên nhiều nền tảng',
        'Sử dụng voucher và mã giảm giá',
        'Đặt phòng vào mùa thấp điểm',
      ],
      views: 2800,
    },
    {
      id: 3,
      title: 'Check-list du lịch an toàn',
      author: 'TravelGo Team',
      avatar: '📚',
      date: '21/01/2025',
      category: 'Cẩm nang',
      image: '✅',
      content: 'Danh sách kiểm tra để đảm bảo chuyến đi an toàn...',
      checklist: [
        'Mua bảo hiểm du lịch',
        'Ghi lại thông tin liên hệ khẩn cấp',
        'Chuẩn bị thuốc men cần thiết',
        'Thông báo lịch trình cho người thân',
      ],
      views: 1900,
    },
  ];

  // Travel Blog Team
  const blogPosts = [
    {
      id: 1,
      title: 'Phỏng vấn Travel Blogger: Kinh nghiệm 10 năm du lịch',
      author: 'TravelGo Editorial',
      avatar: '✍️',
      date: '28/01/2025',
      category: 'Blog',
      image: '🎤',
      imageUrl: '/uploads/destinations/Combo Hà Nội - Hạ Long.jpg',
      content: 'Cuộc trò chuyện với blogger du lịch hàng đầu về những kinh nghiệm quý báu...',
      views: 5400,
    },
    {
      id: 2,
      title: 'Xu hướng du lịch 2025: Sustainable Travel',
      author: 'TravelGo Editorial',
      avatar: '✍️',
      date: '26/01/2025',
      category: 'Blog',
      image: '🌍',
      imageUrl: '/uploads/destinations/Nha Trang 3N2Đ.jpg',
      content: 'Khám phá xu hướng du lịch bền vững đang được quan tâm...',
      views: 3800,
    },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'experience':
        return experiences;
      case 'customer':
        return customerStories;
      case 'guide':
        return guides;
      case 'blog':
        return blogPosts;
      case 'review':
        return reviews || [];
      default:
        return [];
    }
  };

  const content = getTabContent();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            animation: 'float 20s ease-in-out infinite'
          }} />
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-2.5 mb-6">
              <BookOpenIcon className="h-6 w-6" />
              <span className="font-semibold">TravelGo Stories</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              Câu chuyện du lịch
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Lưu giữ kỷ niệm, chia sẻ cảm xúc và trải nghiệm từ những hành trình thật
            </p>
          </div>
        </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200">
          {[
            { id: 'experience', label: 'Trải nghiệm', icon: HeartIcon },
            { id: 'customer', label: 'Câu chuyện khách hàng', icon: UserIcon },
            { id: 'review', label: 'Review & Đánh giá', icon: StarIcon },
            { id: 'guide', label: 'Cẩm nang du lịch', icon: BookOpenIcon },
            { id: 'blog', label: 'Travel Blog', icon: VideoCameraIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StoryType)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-500'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Grid */}
        {activeTab === 'review' && loadingReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'review' && reviews ? (
              reviews.map((review: any) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              content.map((item: any) => (
                <StoryCard
                  key={item.id}
                  story={item}
                  type={activeTab}
                  onSelect={() => setSelectedStory(item.id)}
                />
              ))
            )}
          </div>
        )}

        {content.length === 0 && activeTab !== 'review' && (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có nội dung</h3>
            <p className="text-gray-600">Nội dung sẽ được cập nhật sớm nhất</p>
          </div>
        )}
        {/* Story Detail */}
        {selectedStory !== null && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {(() => {
              const list = activeTab === 'review' ? [] : content;
              const story = (list as any[]).find((s) => s.id === selectedStory);
              if (!story) return null;
              return (
                <article className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="relative h-72 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center text-7xl">
                    {story.image || '🖼️'}
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">{story.category}</span>
                      <span>•</span>
                      <CalendarIcon className="h-4 w-4" />
                      <span>{story.date}</span>
                      {story.views && (
                        <>
                          <span>•</span>
                          <span>{story.views} lượt xem</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{story.title}</h2>
                    {story.content && (
                      <p className="text-gray-700 leading-8 whitespace-pre-line mb-6">
                        {story.content + '\n\n' + (story.content + ' ').repeat(3).trim()}
                      </p>
                    )}
                    {story.checklist && (
                      <ul className="grid sm:grid-cols-2 gap-3 mb-6">
                        {story.checklist.map((item: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-gray-700">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {story.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{story.author}</p>
                          <p className="text-xs text-gray-500">Tác giả</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="px-4 py-2 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black"
                      >
                        Lên đầu trang
                      </button>
                    </div>
                    <div className="mt-6 text-right">
                      <button onClick={() => setSelectedStory(null)} className="text-sm text-gray-600 hover:text-gray-900 underline">
                        Đóng chi tiết
                      </button>
                    </div>
                  </div>
                </article>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

// Story Card Component
function StoryCard({ story, type, onSelect }: { story: any; type: StoryType; onSelect: () => void }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(story.likes || 0);

  return (
    <article
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer"
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center text-6xl overflow-hidden">
        {story.imageUrl ? (
          <img src={story.imageUrl} alt={story.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        ) : story.images ? (
          <div className="grid grid-cols-2 gap-2 w-full h-full p-4">
            {story.images.map((img: string, i: number) => (
              <div key={i} className="bg-white/20 rounded-lg flex items-center justify-center text-4xl">
                {img}
              </div>
            ))}
          </div>
        ) : (
          story.image
        )}
        <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
          {story.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
          {story.title}
        </h3>
        {story.content && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {story.content}
          </p>
        )}

        {/* Checklist for guides */}
        {story.checklist && (
          <ul className="space-y-2 mb-4">
            {story.checklist.map((item: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Tags */}
        {story.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {story.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {story.avatar}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{story.author}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CalendarIcon className="h-3 w-3" />
                {story.date}
                {story.views && (
                  <>
                    <span>•</span>
                    <span>{story.views} lượt xem</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLiked(!liked);
                setLikes(liked ? likes - 1 : likes + 1);
              }}
              className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
            >
              {liked ? (
                <HeartIconSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
              <span className="text-sm">{likes}</span>
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: any }) {
  const [liked, setLiked] = useState(false);

  return (
    <article className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) =>
          i < review.rating ? (
            <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarIcon key={i} className="h-5 w-5 text-gray-300" />
          )
        )}
      </div>

      {review.comment && (
        <p className="text-gray-700 mb-6 leading-relaxed italic text-lg line-clamp-4">
          "{review.comment}"
        </p>
      )}

      {review.destination && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <MapPinIcon className="h-4 w-4" />
          <span>{review.destination.name}</span>
        </div>
      )}

      {review.user && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
            {(review.user.name || review.user.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{review.user.name || 'Khách hàng'}</p>
            <p className="text-sm text-gray-500">{review.user.email}</p>
          </div>
          <button
            onClick={() => setLiked(!liked)}
            className={`${liked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors`}
          >
            {liked ? <HeartIconSolid className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
          </button>
        </div>
      )}
    </article>
  );
}