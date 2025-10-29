import Link from "next/link";

export default function StoriesPage() {
  const stories = [
    {
      title: "Hành trình Bali - Thiên đường nhiệt đới",
      content: "Khám phá văn hóa đảo thiên đường với những ngôi đền cổ kính, bãi biển tuyệt đẹp và ẩm thực đặc sắc. Trải nghiệm yoga tại Ubud và thưởng thức hoàng hôn tại Tanah Lot.",
      author: "Nguyễn Minh",
      location: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=1600&auto=format&fit=crop",
      rating: 5,
      date: "2 tuần trước",
      readTime: "5 phút đọc",
      category: "beach",
      tags: ["beach", "culture", "wellness"]
    },
    {
      title: "Tokyo - Thành phố tương lai",
      content: "Trải nghiệm sự kết hợp hoàn hảo giữa truyền thống và hiện đại trong thành phố không bao giờ ngủ. Từ đền Senso-ji cổ kính đến khu phố điện tử Akihabara sôi động.",
      author: "Trần Linh",
      location: "Tokyo, Nhật Bản",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop",
      rating: 5,
      date: "1 tháng trước",
      readTime: "7 phút đọc",
      category: "city",
      tags: ["city", "culture", "food"]
    },
    {
      title: "Paris - Kinh đô ánh sáng",
      content: "Dạo bước trên những con phố cổ kính, thưởng thức ẩm thực Pháp và ngắm nhìn tháp Eiffel lấp lánh. Khám phá bảo tàng Louvre và thưởng thức croissant tại quán cà phê lãng mạn.",
      author: "Lê Hương",
      location: "Paris, Pháp",
      image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?q=80&w=1600&auto=format&fit=crop",
      rating: 5,
      date: "3 tuần trước",
      readTime: "6 phút đọc",
      category: "city",
      tags: ["city", "culture", "romance"]
    },
    {
      title: "Nepal - Hành trình lên đỉnh thế giới",
      content: "Trải nghiệm trekking tại dãy Himalaya hùng vĩ, gặp gỡ người dân địa phương thân thiện và chiêm ngưỡng đỉnh Everest từ base camp. Một hành trình thử thách nhưng đầy ý nghĩa.",
      author: "Phạm Đức",
      location: "Nepal",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop",
      rating: 5,
      date: "1 tuần trước",
      readTime: "8 phút đọc",
      category: "adventure",
      tags: ["adventure", "nature", "trekking"]
    },
    {
      title: "Thailand - Vương quốc của nụ cười",
      content: "Khám phá Bangkok sôi động, thưởng thức ẩm thực đường phố tuyệt vời và tham quan những ngôi chùa vàng lộng lẫy. Trải nghiệm cuộc sống về đêm tại Khao San Road.",
      author: "Hoàng Mai",
      location: "Bangkok, Thailand",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1600&auto=format&fit=crop",
      rating: 4,
      date: "4 ngày trước",
      readTime: "6 phút đọc",
      category: "city",
      tags: ["city", "food", "culture"]
    },
    {
      title: "New Zealand - Vùng đất của những kỳ quan",
      content: "Lái xe qua những con đường ven biển tuyệt đẹp, tham quan hang động phát sáng Waitomo và trải nghiệm bungee jumping tại Queenstown. New Zealand thực sự là thiên đường cho những người yêu thiên nhiên.",
      author: "Vũ Thành",
      location: "New Zealand",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop",
      rating: 5,
      date: "5 ngày trước",
      readTime: "9 phút đọc",
      category: "nature",
      tags: ["nature", "adventure", "roadtrip"]
    },
    {
      title: "Italy - Hành trình ẩm thực và nghệ thuật",
      content: "Thưởng thức pizza tại Naples, khám phá nghệ thuật tại Florence và dạo bước qua những con kênh lãng mạn của Venice. Italy mang đến trải nghiệm văn hóa và ẩm thực không thể quên.",
      author: "Ngô Lan",
      location: "Italy",
      image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?q=80&w=1600&auto=format&fit=crop",
      rating: 5,
      date: "1 tuần trước",
      readTime: "7 phút đọc",
      category: "culture",
      tags: ["culture", "food", "art"]
    },
    {
      title: "Maldives - Thiên đường biển xanh",
      content: "Nghỉ dưỡng tại resort sang trọng trên biển, lặn ngắm san hô đầy màu sắc và thưởng thức hải sản tươi ngon. Maldives là điểm đến hoàn hảo cho kỳ nghỉ lãng mạn.",
      author: "Đặng Hoa",
      location: "Maldives",
      image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1600&auto=format&fit=crop",
      rating: 5,
      date: "3 ngày trước",
      readTime: "5 phút đọc",
      category: "beach",
      tags: ["beach", "luxury", "romance"]
    },
    {
      title: "Vietnam - Hành trình dọc đất nước hình chữ S",
      content: "Từ Hà Nội cổ kính đến Sài Gòn sôi động, từ vịnh Hạ Long hùng vĩ đến đồng bằng sông Cửu Long trù phú. Khám phá văn hóa đa dạng và ẩm thực phong phú của quê hương.",
      author: "Lý Minh",
      location: "Vietnam",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1600&auto=format&fit=crop",
      rating: 5,
      date: "2 ngày trước",
      readTime: "10 phút đọc",
      category: "culture",
      tags: ["culture", "food", "nature"]
    }
  ];

  // Phân loại stories theo category
  const beachStories = stories.filter(s => s.category === 'beach');
  const cityStories = stories.filter(s => s.category === 'city');
  const adventureStories = stories.filter(s => s.category === 'adventure');
  const cultureStories = stories.filter(s => s.category === 'culture');

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="absolute inset-0 opacity-20" suppressHydrationWarning={true}>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }} suppressHydrationWarning={true} />
        </div>
        
        <div className="relative container py-16 sm:py-24" suppressHydrationWarning={true}>
          <div className="text-center max-w-4xl mx-auto" suppressHydrationWarning={true}>
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-6" suppressHydrationWarning={true}>
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
              Câu chuyện hành trình
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Những câu chuyện
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                đáng nhớ từ khắp thế giới
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Khám phá những trải nghiệm thực tế, cảm xúc chân thật và kỷ niệm đáng nhớ 
              từ những du khách đã đồng hành cùng TravelGo
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{stories.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Câu chuyện</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{new Set(stories.map(s => s.author)).size}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tác giả</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{new Set(stories.map(s => s.location.split(',')[1]?.trim() || s.location)).size}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Quốc gia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Stories */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Câu chuyện mới nhất</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Những trải nghiệm thực tế và cảm xúc chân thật từ du khách
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
            {stories.slice(0, 3).map((story, index) => (
              <article key={index} className="group relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                {/* Image */}
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                      {story.readTime}
                    </span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-500/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {story.category === 'beach' ? '🏖️ Biển' : 
                       story.category === 'city' ? '🏙️ Thành phố' :
                       story.category === 'adventure' ? '🏔️ Mạo hiểm' : '🏛️ Văn hóa'}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8">
                  {/* Location & Date */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {story.location}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{story.date}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {story.title}
                  </h3>
                  
                  {/* Content */}
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed line-clamp-3">
                    {story.content}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {story.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(story.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({story.rating}/5)</span>
                  </div>
                  
                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {story.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{story.author}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Du khách</div>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/destinations/${story.location.toLowerCase().split(',')[0]}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Đọc thêm →
                    </Link>
                  </div>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Beach Stories */}
      {beachStories.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="container">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                <span className="text-2xl">🏖️</span>
                Câu chuyện biển & resort
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Thiên đường biển xanh</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Những trải nghiệm tuyệt vời tại các bãi biển đẹp nhất thế giới
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {beachStories.map((story, index) => (
                <article key={index} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={story.image} 
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {story.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {story.author.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{story.author}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{story.date}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Adventure Stories */}
      {adventureStories.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                <span className="text-2xl">🏔️</span>
                Câu chuyện mạo hiểm
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Khám phá thiên nhiên hoang dã</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Những hành trình thử thách và đầy cảm hứng
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {adventureStories.map((story, index) => (
                <article key={index} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={story.image} 
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {story.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {story.author.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{story.author}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{story.date}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Share Your Story Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-700 rounded-3xl p-8 sm:p-12 shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              
              <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                Chia sẻ câu chuyện của bạn
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Bạn có trải nghiệm du lịch thú vị? Hãy chia sẻ với cộng đồng TravelGo 
                và truyền cảm hứng cho những du khách khác!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Chia sẻ ngay
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Link>
                
                <Link 
                  href="/featured" 
                  className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  Xem điểm đến nổi bật
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-16">
        <div className="container text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}
