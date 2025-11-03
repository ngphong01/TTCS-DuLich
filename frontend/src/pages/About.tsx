import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  TrophyIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  HeartIcon,
  SparklesIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  VideoCameraIcon,
  NewspaperIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

export default function About() {
  const [showVideo, setShowVideo] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState<string | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);

  // count-up animation for KPI
  const [kpi, setKpi] = useState({ destinations: 0, customers: 0, tours: 0 });
  useEffect(() => {
    const targets = { destinations: 500, customers: 50000, tours: 10000 };
    const start = performance.now();
    const duration = 1200;
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setKpi({
        destinations: Math.floor(targets.destinations * p),
        customers: Math.floor(targets.customers * p),
        tours: Math.floor(targets.tours * p),
      });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  async function submitSupport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      userEmail: String(form.get('email') || ''),
      subject: String(form.get('subject') || 'Hỗ trợ từ About'),
      message: String(form.get('message') || ''),
    };
    setSupportSubmitting(true);
    setSupportError(null);
    setSupportSuccess(null);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');
      setSupportSuccess('Đã gửi yêu cầu hỗ trợ. Chúng tôi sẽ liên hệ sớm.');
      (e.currentTarget as HTMLFormElement).reset();
    } catch {
      setSupportError('Gửi thất bại. Vui lòng thử lại.');
    } finally {
      setSupportSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-2.5 mb-6">
              <BuildingOfficeIcon className="h-6 w-6" />
              <span className="font-semibold">Về TravelGo</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
              Giới thiệu về TravelGo
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Hành trình cùng bạn khám phá thế giới, tạo ra những kỷ niệm đáng nhớ trong mọi chuyến đi
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Vì sao chọn TravelGo */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Vì sao chọn TravelGo?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[ 
                { icon: GlobeAltIcon, title: '500+ điểm đến', desc: 'Mạng lưới điểm đến trong và ngoài nước, luôn cập nhật.' },
                { icon: ShieldCheckIcon, title: 'Thanh toán an toàn', desc: 'Chuẩn bảo mật, hoàn tiền theo chính sách.' },
                { icon: TrophyIcon, title: '4.8/5 từ khách hàng', desc: 'Hàng chục nghìn đánh giá tích cực.' },
                { icon: UserGroupIcon, title: 'Hỗ trợ 24/7', desc: 'Đồng hành trước – trong – sau chuyến đi.' },
                { icon: SparklesIcon, title: 'Lịch trình tinh gọn', desc: 'Tối ưu di chuyển, trải nghiệm nhiều hơn.' },
                { icon: HeartIcon, title: 'Ưu đãi độc quyền', desc: 'Voucher thành viên, combo tiết kiệm theo mùa.' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{f.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Giới thiệu công ty */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6">Lịch sử hình thành</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                TravelGo được thành lập vào năm 2015 với sứ mệnh mang đến những trải nghiệm du lịch tuyệt vời cho mọi người. 
                Từ những ngày đầu với chỉ 10 nhân viên, chúng tôi đã phát triển thành một trong những công ty du lịch hàng đầu Việt Nam.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Với hơn 500 điểm đến trên khắp thế giới, hơn 50,000 khách hàng tin tưởng và hơn 10,000 tour đã được tổ chức thành công, 
                TravelGo tự hào là đối tác tin cậy cho mọi hành trình của bạn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl font-bold text-blue-600 mb-2">{kpi.destinations.toLocaleString()}+</div>
                <div className="text-gray-700">Điểm đến</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-2">{Math.floor(kpi.customers/1000)}K+</div>
                <div className="text-gray-700">Khách hàng</div>
              </div>
              <div className="text-center p-6 bg-pink-50 rounded-xl">
                <div className="text-4xl font-bold text-pink-600 mb-2">{Math.floor(kpi.tours/1000)}K+</div>
                <div className="text-gray-700">Tour đã tổ chức</div>
              </div>
            </div>
          </div>
        </section>

        {/* Sứ mệnh, Tầm nhìn, Giá trị */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
              <HeartIcon className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Sứ mệnh</h3>
              <p className="text-white/90">
                Mang đến những trải nghiệm du lịch tuyệt vời, an toàn và đáng nhớ cho mọi khách hàng, 
                giúp họ khám phá thế giới và tạo ra những kỷ niệm quý giá.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
              <SparklesIcon className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Tầm nhìn</h3>
              <p className="text-white/90">
                Trở thành nền tảng du lịch hàng đầu Việt Nam và khu vực Đông Nam Á, 
                được biết đến với chất lượng dịch vụ xuất sắc và sự tin cậy.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-8 text-white">
              <ShieldCheckIcon className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Giá trị cốt lõi</h3>
              <p className="text-white/90">
                Chất lượng, An toàn, Tin cậy, Sáng tạo và Đam mê - 
                những giá trị này là nền tảng cho mọi hoạt động của chúng tôi.
              </p>
            </div>
          </div>
        </section>

        {/* Quy trình đặt chỗ */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
            <h2 className="text-3xl font-bold mb-8">Quy trình đặt chỗ</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[ 
                { n: '01', title: 'Tìm & so sánh', desc: 'Chọn điểm đến, lọc theo ngân sách, chủ đề, thời lượng.' },
                { n: '02', title: 'Đặt chỗ an toàn', desc: 'Điền thông tin, thanh toán an toàn, xác nhận tức thì.' },
                { n: '03', title: 'Tận hưởng', desc: 'Nhận hỗ trợ 24/7, đánh giá để nhận điểm thưởng.' },
              ].map((s) => (
                <div key={s.n} className="p-6 rounded-xl border border-gray-100">
                  <div className="text-4xl font-black text-gray-200">{s.n}</div>
                  <h3 className="mt-2 font-bold text-gray-900">{s.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-4">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-extrabold mb-2">Sẵn sàng cho hành trình mới?</h2>
            <p className="text-white/90 mb-6">Khám phá hàng trăm ưu đãi và điểm đến nổi bật hôm nay.</p>
            <Link to="/destinations" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100">
              Bắt đầu khám phá
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Đội ngũ & Văn hóa */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Đội ngũ & Văn hóa</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Đội ngũ nhiệt tình, chuyên nghiệp và đầy đam mê
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { name: 'Olivia Chen', role: 'CEO', img: 'https://i.pravatar.cc/160?u=olivia.chen' },
              { name: 'Liam Martinez', role: 'Head of Ops', img: 'https://i.pravatar.cc/160?u=liam.martinez' },
              { name: 'Sofia Ivanova', role: 'Product Lead', img: 'https://i.pravatar.cc/160?u=sofia.ivanova' },
              { name: 'Noah Schmidt', role: 'Tour Manager', img: 'https://i.pravatar.cc/160?u=noah.schmidt' },
              { name: 'Aiko Tanaka', role: 'CX Manager', img: 'https://i.pravatar.cc/160?u=aiko.tanaka' },
              { name: 'Mateo Rossi', role: 'Partnerships', img: 'https://i.pravatar.cc/160?u=mateo.rossi' },
            ].map((m) => (
              <div key={m.name} className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 text-center">
                <img src={m.img} alt={m.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3" loading="lazy" />
                <div className="font-semibold text-gray-900">{m.name}</div>
                <div className="text-xs text-gray-500">{m.role}</div>
              </div>
            ))}
          </div>

          
      </section>


        {/* Đối tác & Nhà tài trợ */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Đối tác & Nhà tài trợ</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hợp tác với những thương hiệu hàng đầu
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {['✈️', '🏨', '🚢', '🚌', '🍽️', '🎫'].map((icon, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center text-5xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                {icon}
                  </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Đối tác của chúng tôi bao gồm:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Hãng hàng không</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Vietnam Airlines</li>
                  <li>• VietJet Air</li>
                  <li>• Bamboo Airways</li>
                  <li>• Jetstar Pacific</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Khách sạn</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• InterContinental</li>
                  <li>• Marriott</li>
                  <li>• Hilton</li>
                  <li>• Accor Hotels</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Công ty lữ hành</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Saigontourist</li>
                  <li>• Vietravel</li>
                  <li>• Fiditour</li>
                  <li>• Lửa Việt</li>
                </ul>
              </div>
          </div>
        </div>
      </section>

        {/* Chứng nhận & Giải thưởng */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <TrophyIcon className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Chứng nhận & Giải thưởng</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-3">Top 10 công ty du lịch uy tín Việt Nam</h3>
                <p className="text-gray-600">
                  TravelGo đã được vinh danh trong top 10 công ty du lịch uy tín nhất Việt Nam năm 2024 
                  bởi Hiệp hội Du lịch Việt Nam.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-3">ISO 9001:2015</h3>
                <p className="text-gray-600">
                  Chứng nhận ISO về hệ thống quản lý chất lượng, đảm bảo dịch vụ luôn đạt tiêu chuẩn cao nhất.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-3">TravelAwards 2024</h3>
                <p className="text-gray-600">
                  Giải thưởng "Công ty du lịch tốt nhất năm 2024" do tạp chí Travel+Leisure bình chọn.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-3">Certified Travel Agency</h3>
                <p className="text-gray-600">
                  Chứng nhận từ Tổng cục Du lịch về hoạt động kinh doanh lữ hành quốc tế.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ + Contact */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {/* FAQ */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold mb-6">Câu hỏi thường gặp</h2>
              {[
                { q: 'Đặt chỗ có hoàn tiền không?', a: 'Tuỳ hạng vé/tour. Nhiều sản phẩm hỗ trợ hoàn/đổi theo chính sách hiển thị khi đặt.' },
                { q: 'Thanh toán có an toàn?', a: 'Chúng tôi sử dụng chuẩn bảo mật và đối tác cổng thanh toán uy tín, hỗ trợ VietQR.' },
                { q: 'Có hỗ trợ 24/7?', a: 'Đội ngũ CSKH sẵn sàng hỗ trợ qua chat/email/điện thoại trước–trong–sau chuyến đi.' },
              ].map((it, i) => (
                <div key={i} className="border-b last:border-b-0">
                  <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} className="w-full text-left py-3 font-semibold flex items-center justify-between">
                    {it.q}
                    <span className="text-gray-400">{faqOpen===i?'-':'+'}</span>
                  </button>
                  {faqOpen===i && <p className="pb-4 text-gray-600">{it.a}</p>}
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold mb-6">Liên hệ nhanh</h2>
              <form onSubmit={submitSupport} className="space-y-3">
                <input name="email" type="email" placeholder="Email của bạn" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                <input name="subject" type="text" placeholder="Chủ đề" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                <textarea name="message" placeholder="Nội dung..." required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 min-h-[120px]" />
                <button disabled={supportSubmitting} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold disabled:opacity-60">
                  {supportSubmitting ? 'Đang gửi...' : 'Gửi liên hệ'}
                </button>
                {supportSuccess && <p className="text-green-600 text-sm">{supportSuccess}</p>}
                {supportError && <p className="text-red-600 text-sm">{supportError}</p>}
              </form>
            </div>
          </div>
        </section>

        {/* Báo chí & Truyền thông */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Báo chí & Truyền thông</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              TravelGo trên các phương tiện truyền thông
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'VnExpress', category: 'Báo mạng', date: '15/01/2025' },
              { title: 'Tuổi Trẻ', category: 'Báo in', date: '10/01/2025' },
              { title: 'VTV1', category: 'Truyền hình', date: '05/01/2025' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
              >
                <NewspaperIcon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {item.category}
                  </span>
                  <span>{item.date}</span>
                </div>
                <Link
                  to="#"
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-sm"
                >
                  Đọc bài viết
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Tuyển dụng */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <div className="flex items-center justify-between flex-wrap gap-6 mb-8">
              <div>
                <AcademicCapIcon className="h-12 w-12 text-green-600 mb-4" />
                <h2 className="text-4xl font-bold mb-4">Tuyển dụng</h2>
                <p className="text-xl text-gray-700">
                  Tham gia đội ngũ TravelGo và cùng chúng tôi tạo ra những trải nghiệm tuyệt vời
                </p>
              </div>
              <Link
                to="/contact"
                className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg"
              >
                Ứng tuyển ngay
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Hướng dẫn viên du lịch', location: 'Toàn quốc', type: 'Full-time' },
                { title: 'Tư vấn viên du lịch', location: 'Hà Nội, TP.HCM', type: 'Full-time' },
                { title: 'Nhân viên Marketing', location: 'TP.HCM', type: 'Full-time' },
              ].map((job, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                >
                  <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span>{job.type}</span>
                  </div>
                  <Link
                    to="/contact"
                    className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 text-sm"
                  >
                    Chi tiết
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </section>

        {/* Chính sách */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Chính sách</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cam kết bảo vệ quyền lợi khách hàng
            </p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Bảo mật thông tin', icon: ShieldCheckIcon },
              { title: 'Hoàn tiền', icon: DocumentTextIcon },
              { title: 'Điều khoản sử dụng', icon: GlobeAltIcon },
            ].map((policy, i) => {
              const Icon = policy.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer"
                >
                  <Icon className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{policy.title}</h3>
                  <p className="text-gray-600 mb-4">
                    Xem chi tiết chính sách {policy.title.toLowerCase()} của TravelGo
                  </p>
                  <Link
                    to="#"
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-sm"
                  >
                    Đọc thêm
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
          </div>
        </div>
  );
}