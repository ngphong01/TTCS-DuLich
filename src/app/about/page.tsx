import { 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  UsersIcon,
  StarIcon,
  TrophyIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  PlayIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Hero Section - Redesigned */}
      <section className="relative overflow-hidden pt-24 pb-20">
        {/* Modern Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-400/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            {/* Modern Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Về TravelGo</span>
            </div>

            {/* Elegant Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Giới thiệu
              </span>
              <br />
              <span className="text-gray-800">TravelGo</span>
            </h1>

            {/* Refined Subtitle */}
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-medium">
                Nền tảng du lịch <span className="text-blue-600 font-bold">hàng đầu Việt Nam</span>, 
                kết nối bạn với những trải nghiệm <span className="text-purple-600 font-bold">độc đáo</span> 
                trên khắp thế giới với công nghệ <span className="text-pink-600 font-bold">AI tiên tiến</span>.
            </p>
          </div>

            {/* Modern CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <PlayIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Khám phá ngay
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group flex items-center justify-center gap-3 bg-white/90 text-gray-700 px-10 py-4 rounded-xl font-semibold text-lg border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                <UsersIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Liên hệ tư vấn
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Redesigned */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Con số ấn tượng
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những thành tựu đáng tự hào của TravelGo trong hành trình phục vụ khách hàng
            </p>
            </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: "500+", label: "Điểm đến", icon: GlobeAltIcon, color: "blue", bgColor: "bg-blue-50", iconColor: "text-blue-600" },
              { number: "50K+", label: "Khách hàng", icon: UsersIcon, color: "purple", bgColor: "bg-purple-50", iconColor: "text-purple-600" },
              { number: "4.8⭐", label: "Đánh giá", icon: StarIcon, color: "yellow", bgColor: "bg-yellow-50", iconColor: "text-yellow-600" },
              { number: "24/7", label: "Hỗ trợ", icon: ShieldCheckIcon, color: "green", bgColor: "bg-green-50", iconColor: "text-green-600" }
            ].map((stat, index) => (
              <div key={index} className="group text-center">
                <div className={`${stat.bgColor} p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1`}>
                  <div className={`inline-flex p-4 rounded-xl ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
            </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values - Modern Design */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Triết lý của chúng tôi
        </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ba giá trị cốt lõi định hướng mọi hoạt động và quyết định của TravelGo
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "Sứ mệnh",
                icon: GlobeAltIcon,
                content: "Kết nối du khách với những trải nghiệm độc đáo trên khắp thế giới, mang đến những hành trình đáng nhớ và ý nghĩa.",
                color: "blue",
                bgColor: "bg-blue-50",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600"
              },
              {
                title: "Tầm nhìn",
                icon: SparklesIcon,
                content: "Trở thành nền tảng du lịch số 1 Việt Nam, được tin tưởng bởi hàng triệu du khách trong và ngoài nước.",
                color: "purple",
                bgColor: "bg-purple-50",
                iconBg: "bg-purple-100",
                iconColor: "text-purple-600"
              },
              {
                title: "Giá trị",
                icon: ShieldCheckIcon,
                content: "Minh bạch, an toàn, tiện lợi và hỗ trợ tận tâm 24/7. Đặt khách hàng làm trung tâm trong mọi hoạt động.",
                color: "green",
                bgColor: "bg-green-50",
                iconBg: "bg-green-100",
                iconColor: "text-green-600"
              }
            ].map((item, index) => (
              <div key={index} className={`group relative ${item.bgColor} rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100`}>
                <div className="text-center">
                  <div className={`inline-flex p-4 rounded-xl ${item.iconBg} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-10 w-10 ${item.iconColor}`} />
            </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-medium">{item.content}</p>
          </div>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Modern Design */}
      <section className="py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Tại sao chọn TravelGo?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Những tính năng vượt trội và dịch vụ chuyên nghiệp giúp bạn có trải nghiệm du lịch hoàn hảo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: RocketLaunchIcon, title: "Đặt chỗ nhanh chóng", desc: "Quy trình đặt chỗ đơn giản, thanh toán an toàn và xác nhận ngay lập tức.", color: "blue" },
              { icon: ShieldCheckIcon, title: "Bảo mật tuyệt đối", desc: "Thông tin cá nhân và thanh toán được mã hóa, bảo vệ an toàn tuyệt đối.", color: "green" },
              { icon: UsersIcon, title: "Hỗ trợ 24/7", desc: "Đội ngũ chuyên viên tư vấn luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.", color: "purple" },
              { icon: StarIcon, title: "Trải nghiệm chất lượng", desc: "Chọn lọc kỹ lưỡng các điểm đến và dịch vụ chất lượng cao nhất.", color: "yellow" },
              { icon: TrophyIcon, title: "Giá cả cạnh tranh", desc: "Cam kết mang đến mức giá tốt nhất với nhiều ưu đãi hấp dẫn.", color: "red" },
              { icon: LightBulbIcon, title: "Công nghệ AI", desc: "Ứng dụng AI và công nghệ hiện đại để tối ưu trải nghiệm du lịch.", color: "indigo" }
            ].map((feature, index) => (
              <div key={index} className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100">
                <div className={`inline-flex p-4 rounded-xl bg-${feature.color}-50 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
            </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{feature.desc}</p>
          </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack - Modern Design */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Công nghệ hiện đại
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Được xây dựng với những công nghệ tiên tiến nhất để mang đến trải nghiệm tốt nhất
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Next.js", desc: "App Router", bg: "bg-gray-800", text: "text-white", icon: "⚡" },
              { name: "Tailwind", desc: "CSS v4", bg: "bg-blue-500", text: "text-white", icon: "🎨" },
              { name: "Prisma", desc: "Database ORM", bg: "bg-green-600", text: "text-white", icon: "🗄️" },
              { name: "AI", desc: "Google Gemini", bg: "bg-purple-600", text: "text-white", icon: "🤖" }
            ].map((tech, index) => (
              <div key={index} className="group text-center">
                <div className={`${tech.bg} ${tech.text} w-24 h-24 rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1`}>
                  <span className="text-2xl mb-1">{tech.icon}</span>
                  <span className="font-bold text-sm">{tech.name}</span>
                </div>
                <p className="text-gray-700 font-semibold">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team - Modern Design */}
      <section className="py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Đội ngũ lãnh đạo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Những con người tài năng và tâm huyết đứng sau thành công của TravelGo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { role: "CEO", name: "Nguyễn Thị Mỹ Linh", title: "Giám đốc điều hành", color: "blue", image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=600&auto=format&fit=crop" },
              { role: "CTO", name: "Trần Thanh Chi", title: "Giám đốc công nghệ", color: "green", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop" },
              { role: "CMO", name: "Lê Mạnh Hùng", title: "Giám đốc marketing", color: "purple", image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=600&auto=format&fit=crop" }
            ].map((member, index) => (
              <div key={index} className="group text-center bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100">
                <div className="relative w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-${member.color}-100 text-${member.color}-700 border border-${member.color}-200 shadow-sm`}>
                    {member.role}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-gray-600 font-medium">{member.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Modern Design */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Liên hệ với chúng tôi</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Sẵn sàng khám phá thế giới? Hãy để TravelGo đồng hành cùng bạn trong những hành trình đáng nhớ.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: MapPinIcon, title: "Địa chỉ", desc: "123 Đường ABC, Quận 1, TP.HCM", color: "blue" },
              { icon: PhoneIcon, title: "Điện thoại", desc: "+84 123 456 789", color: "green" },
              { icon: EnvelopeIcon, title: "Email", desc: "info@travelgo.com", color: "purple" }
            ].map((contact, index) => (
              <div key={index} className="text-center text-white">
                <div className="inline-flex p-4 rounded-xl bg-white/20 backdrop-blur-sm mb-4">
                  <contact.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">{contact.title}</h3>
                <p className="opacity-90">{contact.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="group bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3">
              <RocketLaunchIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
              Khám phá ngay
            </button>
            <button className="group border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3">
              <UsersIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
              Tư vấn miễn phí
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}