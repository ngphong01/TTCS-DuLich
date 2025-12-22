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

  const { data: reviewsData, isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', 'featured'],
    queryFn: () => getFeaturedReviews(20),
  });

  // Mock reviews để có nhiều review hơn
  const mockReviews = [
    {
      id: 101,
      rating: 5,
      comment: 'Tour Đà Lạt của TravelGo thật sự tuyệt vời! Hướng dẫn viên nhiệt tình, lịch trình hợp lý, và cảnh đẹp không thể chê. Nhất định sẽ quay lại!',
      user: { name: 'Nguyễn Minh Anh', email: 'nguyenminhanh@gmail.com', avatarUrl: '/uploads/avatars/da-lat.jpg' },
      destination: { name: 'Đà Lạt' },
      createdAt: '2025-01-20T10:00:00Z',
    },
    {
      id: 102,
      rating: 5,
      comment: 'Phú Quốc đẹp như mơ! Resort 5 sao, dịch vụ chu đáo, thức ăn ngon. Gia đình tôi rất hài lòng với chuyến đi này.',
      user: { name: 'Trần Thị Lan', email: 'tranthilan@gmail.com', avatarUrl: '/uploads/avatars/phu-quoc.jpg' },
      destination: { name: 'Phú Quốc' },
      createdAt: '2025-01-18T14:30:00Z',
    },
    {
      id: 103,
      rating: 4,
      comment: 'Hạ Long Bay là một kỳ quan! Du thuyền sang trọng, view đẹp, nhưng thời tiết hơi lạnh. Vẫn rất đáng để đi!',
      user: { name: 'Lê Văn Hoàng', email: 'levanhoang@gmail.com', avatarUrl: '/uploads/avatars/ha-long4.jpg' },
      destination: { name: 'Hạ Long' },
      createdAt: '2025-01-15T09:15:00Z',
    },
    {
      id: 104,
      rating: 5,
      comment: 'Sapa vào mùa lúa chín là tuyệt vời nhất! Ruộng bậc thang vàng óng, không khí trong lành, người dân thân thiện. Cảm ơn TravelGo!',
      user: { name: 'Phạm Thị Mai', email: 'phamthimai@gmail.com', avatarUrl: '/uploads/avatars/sapa.jpg' },
      destination: { name: 'Sapa' },
      createdAt: '2025-01-12T16:45:00Z',
    },
    {
      id: 105,
      rating: 5,
      comment: 'Hội An về đêm thật sự lãng mạn! Đèn lồng lung linh, ẩm thực ngon, phố cổ đẹp. Đây là điểm đến không thể bỏ qua.',
      user: { name: 'Hoàng Văn Đức', email: 'hoangvanduc@gmail.com', avatarUrl: '/uploads/avatars/hoi-an.png' },
      destination: { name: 'Hội An' },
      createdAt: '2025-01-10T11:20:00Z',
    },
    {
      id: 106,
      rating: 4,
      comment: 'Nha Trang có biển đẹp, nước trong xanh. Vinpearl Land rất vui, nhưng giá hơi cao. Nhìn chung là một chuyến đi thú vị!',
      user: { name: 'Đỗ Thị Hương', email: 'dothihuong@gmail.com', avatarUrl: '/uploads/avatars/nha-trang.jpg' },
      destination: { name: 'Nha Trang' },
      createdAt: '2025-01-08T13:00:00Z',
    },
    {
      id: 107,
      rating: 5,
      comment: 'Hà Nội là thành phố của văn hóa và lịch sử. Phở ngon nhất, người dân thân thiện, giá cả hợp lý. Rất thích!',
      user: { name: 'Vũ Văn Tuấn', email: 'vuvantuan@gmail.com', avatarUrl: '/uploads/avatars/ha-noi.jpg' },
      destination: { name: 'Hà Nội' },
      createdAt: '2025-01-05T08:30:00Z',
    },
    {
      id: 108,
      rating: 5,
      comment: 'Đà Nẵng - thành phố đáng sống! Bà Nà Hills, Cầu Vàng, biển đẹp. Dịch vụ của TravelGo rất chuyên nghiệp!',
      user: { name: 'Bùi Thị Hoa', email: 'buithihoa@gmail.com', avatarUrl: '/uploads/avatars/da-nang.png' },
      destination: { name: 'Đà Nẵng' },
      createdAt: '2025-01-03T15:10:00Z',
    },
    {
      id: 109,
      rating: 5,
      comment: 'Huế thật sự là một thành phố cổ kính và đẹp. Lăng tẩm, đền đài, ẩm thực cung đình... Tất cả đều tuyệt vời!',
      user: { name: 'Ngô Văn Thành', email: 'ngovanthanh@gmail.com', avatarUrl: '/uploads/avatars/hue.jpg' },
      destination: { name: 'Huế' },
      createdAt: '2025-01-01T12:00:00Z',
    },
  ];

  // Kết hợp reviews từ API và mock reviews
  const reviews = reviewsData && reviewsData.length > 0 ? reviewsData : mockReviews;

  // Mock data - Trải nghiệm du lịch thật
  const experiences = [
    {
      id: 1,
      title: 'Hành trình một mình ở Đà Lạt',
      author: 'Olivia Chen',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/da-lat.jpg',
      date: '20/01/2025',
      category: 'Trải nghiệm',
      image: '🏔️',
      imageUrl: '/uploads/destinations/Tour-Da-Lat-3-Ngay-2-Dem.png',
      content: 'Chuyến đi Đà Lạt một mình đã thay đổi hoàn toàn cách nhìn của tôi về du lịch. Tôi học được cách tự lập, khám phá những góc nhỏ xinh đẹp của thành phố sương mù, và tận hưởng sự yên bình khi đi một mình.',
      likes: 1425,
      views: 1200,
      tags: ['Đà Lạt', 'Du lịch một mình', 'Thiên nhiên'],
    },
    {
      id: 2,
      title: 'Chuyến đi cuối cùng cùng người ấy',
      author: 'Liam Martinez',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/phu-quoc.jpg',
      date: '18/01/2025',
      category: 'Trải nghiệm',
      image: '💑',
      imageUrl: '/uploads/destinations/Hội An - Đà Nẵng.jpg',
      content: 'Một hành trình đầy cảm xúc tại Phú Quốc, nơi chúng tôi tạo ra những kỷ niệm cuối cùng. Biển xanh, cát trắng, và những khoảnh khắc không thể quên bên nhau.',
      likes: 2380,
      views: 2800,
      tags: ['Phú Quốc', 'Cảm xúc', 'Kỷ niệm'],
    },
    {
      id: 3,
      title: 'Khám phá Sapa vào mùa lúa chín',
      author: 'Sofia Ivanova',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/sapa.jpg',
      date: '15/01/2025',
      category: 'Trải nghiệm',
      image: '🌾',
      imageUrl: '/uploads/destinations/Sapa Trekking 2N1Đ.jpg',
      content: 'Sapa vào mùa lúa chín là một khung cảnh tuyệt vời mà mọi người nên được trải nghiệm ít nhất một lần. Ruộng bậc thang vàng óng dưới ánh nắng mặt trời tạo nên một bức tranh thiên nhiên tuyệt đẹp.',
      likes: 1530,
      views: 950,
      tags: ['Sapa', 'Mùa lúa chín', 'Trekking'],
    },
    {
      id: 4,
      title: 'Hạ Long Bay - Kỳ quan thiên nhiên thế giới',
      author: 'Michael Thompson',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/ha-long4.jpg',
      date: '12/01/2025',
      category: 'Trải nghiệm',
      image: '⛵',
      imageUrl: '/uploads/destinations/Combo Hà Nội - Hạ Long.jpg',
      content: 'Du thuyền trên vịnh Hạ Long là trải nghiệm không thể quên. Hàng nghìn đảo đá vôi nhô lên từ mặt nước xanh ngọc, tạo nên một khung cảnh như trong phim. Đêm ngủ trên thuyền, ngắm sao trời, thật sự là một kỳ nghỉ đáng nhớ.',
      likes: 2100,
      views: 3200,
      tags: ['Hạ Long', 'Du thuyền', 'Thiên nhiên'],
    },
    {
      id: 5,
      title: 'Hội An - Phố cổ đèn lồng lung linh',
      author: 'Emma Wilson',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/hoi-an.png',
      date: '10/01/2025',
      category: 'Trải nghiệm',
      image: '🏮',
      imageUrl: '/uploads/destinations/combo-da-nang-hoi-an.jpg',
      content: 'Hội An vào ban đêm là một thế giới khác. Những chiếc đèn lồng đủ màu sắc thắp sáng con phố cổ, tạo nên không gian lãng mạn và ấm áp. Đi dạo dọc sông Thu Bồn, thưởng thức ẩm thực địa phương, và mua sắm tại các cửa hàng thủ công.',
      likes: 1890,
      views: 2800,
      tags: ['Hội An', 'Phố cổ', 'Đèn lồng'],
    },
    {
      id: 6,
      title: 'Nha Trang - Thiên đường biển đảo',
      author: 'David Kim',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/nha-trang.jpg',
      date: '08/01/2025',
      category: 'Trải nghiệm',
      image: '🏖️',
      imageUrl: '/uploads/destinations/Nha Trang 3N2Đ.jpg',
      content: 'Nha Trang với bãi biển dài, nước trong xanh và những hoạt động biển thú vị. Tôi đã thử lặn biển, chèo thuyền kayak, và thưởng thức hải sản tươi ngon. Vinpearl Land cũng là điểm đến không thể bỏ qua.',
      likes: 1750,
      views: 2400,
      tags: ['Nha Trang', 'Biển', 'Vui chơi'],
    },
    {
      id: 7,
      title: 'Phú Quốc - Nghỉ dưỡng sang trọng',
      author: 'Sarah Johnson',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/phu-quoc.jpg',
      date: '05/01/2025',
      category: 'Trải nghiệm',
      image: '🌴',
      imageUrl: '/uploads/destinations/Tour Phú Quốc 4N3Đ.png',
      content: 'Phú Quốc không chỉ có biển đẹp mà còn có những resort 5 sao tuyệt vời. Tôi đã ở tại một resort với bungalow trên biển, có spa riêng và nhà hàng hải sản. Buổi sáng ngắm bình minh, tối ngắm hoàng hôn, thật sự là một kỳ nghỉ hoàn hảo.',
      likes: 2200,
      views: 3500,
      tags: ['Phú Quốc', 'Resort', 'Nghỉ dưỡng'],
    },
    {
      id: 8,
      title: 'Hà Nội - Thủ đô nghìn năm văn hiến',
      author: 'James Park',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/ha-noi.jpg',
      date: '03/01/2025',
      category: 'Trải nghiệm',
      image: '🏛️',
      imageUrl: '/uploads/destinations/ha-noi-ha-long-ninh-binh.jpg',
      content: 'Hà Nội là thành phố của lịch sử và văn hóa. Tôi đã đi tham quan Văn Miếu, Hồ Hoàn Kiếm, Phố cổ 36 phố phường. Ẩm thực Hà Nội cũng rất đặc sắc - phở, bún chả, chả cá Lã Vọng... Mỗi món đều mang hương vị riêng.',
      likes: 1950,
      views: 2900,
      tags: ['Hà Nội', 'Văn hóa', 'Ẩm thực'],
    },
  ];

  // Câu chuyện khách hàng
  const customerStories = [
    {
      id: 1,
      title: 'Hình ảnh & video review thật từ hành trình Đà Nẵng',
      author: 'Nguyễn Thị Hoa',
      avatar: '📷',
      avatarUrl: '/uploads/avatars/da-nang.png',
      date: '22/01/2025',
      category: 'Review',
      imageUrl: '/uploads/destinations/Combo Hà Nội - Hạ Long.jpg',
      content: 'Chuyến đi Đà Nẵng của gia đình tôi thật sự tuyệt vời! Bà Nà Hills, Cầu Vàng, biển Mỹ Khê... Tất cả đều đẹp như mơ. TravelGo đã tổ chức rất chuyên nghiệp!',
      likes: 1856,
      views: 4500,
    },
    {
      id: 2,
      title: 'Cảm xúc sau tour Hội An 3 ngày',
      author: 'Trần Văn Nam',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/hoi-an.png',
      date: '19/01/2025',
      category: 'Chia sẻ',
      imageUrl: '/uploads/destinations/Hội An - Đà Nẵng.jpg',
      content: 'Tour Hội An của TravelGo đã vượt quá mong đợi của chúng tôi. Đội ngũ hướng dẫn viên chuyên nghiệp, lịch trình hợp lý. Phố cổ về đêm lung linh, ẩm thực ngon tuyệt!',
      likes: 1408,
      views: 2100,
    },
    {
      id: 3,
      title: 'Kỷ niệm đáng nhớ tại Phú Quốc',
      author: 'Lê Thị Mai',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/phu-quoc.jpg',
      date: '17/01/2025',
      category: 'Chia sẻ',
      imageUrl: '/uploads/destinations/Tour Phú Quốc 4N3Đ.png',
      content: 'Phú Quốc là thiên đường nghỉ dưỡng! Resort 5 sao, biển xanh cát trắng, hải sản tươi ngon. Chuyến đi tuần trăng mật của chúng tôi thật hoàn hảo!',
      likes: 2100,
      views: 3800,
    },
    {
      id: 4,
      title: 'Hạ Long Bay - Kỳ quan thiên nhiên',
      author: 'Phạm Văn Đức',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/ha-long4.jpg',
      date: '15/01/2025',
      category: 'Review',
      imageUrl: '/uploads/destinations/Combo Hà Nội - Hạ Long.jpg',
      content: 'Du thuyền trên vịnh Hạ Long là trải nghiệm không thể quên. Cảnh đẹp như tranh vẽ, thức ăn trên tàu ngon, dịch vụ chu đáo. Đêm ngủ trên thuyền ngắm sao trời thật tuyệt!',
      likes: 1950,
      views: 3200,
    },
    {
      id: 5,
      title: 'Sapa trekking - Hành trình đáng nhớ',
      author: 'Hoàng Thị Lan',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/sapa.jpg',
      date: '13/01/2025',
      category: 'Chia sẻ',
      imageUrl: '/uploads/destinations/Sapa Trekking 2N1Đ.jpg',
      content: 'Trekking ở Sapa thật sự là một trải nghiệm tuyệt vời! Ruộng bậc thang, người dân thân thiện, không khí trong lành. Cảm ơn TravelGo đã tổ chức tour tuyệt vời!',
      likes: 1680,
      views: 2900,
    },
    {
      id: 6,
      title: 'Nha Trang - Thiên đường biển đảo',
      author: 'Đỗ Văn Tuấn',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/nha-trang.jpg',
      date: '11/01/2025',
      category: 'Review',
      imageUrl: '/uploads/destinations/Nha Trang 3N2Đ.jpg',
      content: 'Nha Trang có biển đẹp, nước trong xanh. Vinpearl Land rất vui, lặn biển thú vị. Gia đình tôi đã có một kỳ nghỉ tuyệt vời!',
      likes: 1520,
      views: 2600,
    },
    {
      id: 7,
      title: 'Đà Lạt - Thành phố sương mù lãng mạn',
      author: 'Vũ Thị Hương',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/da-lat.jpg',
      date: '09/01/2025',
      category: 'Chia sẻ',
      imageUrl: '/uploads/destinations/Tour-Da-Lat-3-Ngay-2-Dem.png',
      content: 'Đà Lạt thật sự lãng mạn! Khí hậu mát mẻ, cảnh đẹp, hoa đủ màu sắc. Đi cùng người yêu và thưởng thức cà phê trên đồi thông là kỷ niệm đẹp nhất!',
      likes: 1780,
      views: 3100,
    },
    {
      id: 8,
      title: 'Huế - Cố đô cổ kính',
      author: 'Bùi Văn Long',
      avatar: '👤',
      avatarUrl: '/uploads/avatars/hue.jpg',
      date: '07/01/2025',
      category: 'Review',
      imageUrl: '/uploads/destinations/combo-da-nang-hoi-an.jpg',
      content: 'Huế là thành phố của lịch sử. Lăng tẩm, đền đài, ẩm thực cung đình... Tất cả đều tuyệt vời. Tour một ngày của TravelGo rất đầy đủ!',
      likes: 1450,
      views: 2400,
    },
  ];

  // Cẩm nang du lịch
  const guides = [
    {
      id: 1,
      title: 'Mẹo vặt du lịch: Visa, hành lý, thời tiết, tiền tệ',
      author: 'Nguyễn Thị Hạnh',
      avatar: '📚',
      avatarUrl: '/uploads/avatars/ha-noi.jpg',
      date: '25/01/2025',
      category: 'Cẩm nang',
      image: '✈️',
      imageUrl: '/uploads/destinations/combo-ve-may-bay-va-khach-san.jpg',
      content: 'Những mẹo hữu ích để bạn chuẩn bị tốt nhất cho chuyến đi. Từ việc kiểm tra visa, chuẩn bị hành lý, theo dõi thời tiết đến đổi tiền tệ, tất cả đều quan trọng để có một chuyến đi suôn sẻ.',
      checklist: [
        'Kiểm tra visa trước 30 ngày',
        'Chuẩn bị hành lý theo quy định',
        'Theo dõi thời tiết điểm đến',
        'Đổi tiền trước khi đi',
      ],
      views: 3200,
      likes: 1856,
    },
    {
      id: 2,
      title: 'Hướng dẫn săn vé rẻ / đặt phòng / chọn tour',
      author: 'Trần Văn Minh',
      avatar: '📚',
      avatarUrl: '/uploads/avatars/nha-trang.jpg',
      date: '23/01/2025',
      category: 'Cẩm nang',
      image: '🎯',
      imageUrl: '/uploads/destinations/Nha Trang 3N2Đ.jpg',
      content: 'Bí kíp để có được giá tốt nhất cho chuyến đi của bạn. Từ việc đặt vé sớm, so sánh giá trên nhiều nền tảng, sử dụng voucher đến chọn thời điểm đi phù hợp.',
      checklist: [
        'Đặt vé sớm 2-3 tháng',
        'So sánh giá trên nhiều nền tảng',
        'Sử dụng voucher và mã giảm giá',
        'Đặt phòng vào mùa thấp điểm',
      ],
      views: 2800,
      likes: 1408,
    },
    {
      id: 3,
      title: 'Check-list du lịch an toàn',
      author: 'Lê Thị Hoa',
      avatar: '📚',
      avatarUrl: '/uploads/avatars/da-nang.png',
      date: '21/01/2025',
      category: 'Cẩm nang',
      image: '✅',
      imageUrl: '/uploads/destinations/Staycation cuối tuần.jpg',
      content: 'Danh sách kiểm tra để đảm bảo chuyến đi an toàn. Từ mua bảo hiểm, ghi thông tin liên hệ khẩn cấp, chuẩn bị thuốc men đến thông báo lịch trình cho người thân.',
      checklist: [
        'Mua bảo hiểm du lịch',
        'Ghi lại thông tin liên hệ khẩn cấp',
        'Chuẩn bị thuốc men cần thiết',
        'Thông báo lịch trình cho người thân',
      ],
      views: 1900,
      likes: 1530,
    },
    {
      id: 4,
      title: 'Hướng dẫn chụp ảnh du lịch đẹp',
      author: 'Phạm Văn Anh',
      avatar: '📚',
      avatarUrl: '/uploads/avatars/hoi-an.png',
      date: '19/01/2025',
      category: 'Cẩm nang',
      image: '📸',
      imageUrl: '/uploads/destinations/Hội An - Đà Nẵng.jpg',
      content: 'Bí kíp chụp ảnh du lịch đẹp để lưu giữ những khoảnh khắc đáng nhớ. Từ góc chụp, ánh sáng, thời điểm đến cách chỉnh sửa ảnh.',
      checklist: [
        'Chọn thời điểm ánh sáng đẹp (sáng sớm, chiều tối)',
        'Tìm góc chụp độc đáo',
        'Sử dụng quy tắc 1/3',
        'Chụp nhiều góc độ khác nhau',
      ],
      views: 2400,
      likes: 1280,
    },
    {
      id: 5,
      title: 'Packing list - Danh sách đồ cần mang',
      author: 'Hoàng Thị Linh',
      avatar: '📚',
      avatarUrl: '/uploads/avatars/phu-quoc.jpg',
      date: '17/01/2025',
      category: 'Cẩm nang',
      image: '🧳',
      imageUrl: '/uploads/destinations/Tour Phú Quốc 4N3Đ.png',
      content: 'Danh sách đầy đủ những đồ cần mang khi đi du lịch. Từ quần áo, giày dép, đồ dùng cá nhân đến các vật dụng cần thiết khác.',
      checklist: [
        'Quần áo phù hợp thời tiết',
        'Giày dép thoải mái',
        'Đồ dùng vệ sinh cá nhân',
        'Sạc pin, adapter',
      ],
      views: 2100,
      likes: 1100,
    },
    {
      id: 6,
      title: 'Du lịch bền vững - Bảo vệ môi trường',
      author: 'Đỗ Văn Hùng',
      avatar: '📚',
      avatarUrl: '/uploads/avatars/sapa.jpg',
      date: '15/01/2025',
      category: 'Cẩm nang',
      image: '🌱',
      imageUrl: '/uploads/destinations/Sapa Trekking 2N1Đ.jpg',
      content: 'Cách du lịch bền vững để bảo vệ môi trường. Từ việc giảm rác thải, tiết kiệm năng lượng đến tôn trọng văn hóa địa phương.',
      checklist: [
        'Giảm sử dụng đồ nhựa',
        'Tiết kiệm nước và điện',
        'Tôn trọng văn hóa địa phương',
        'Hỗ trợ cộng đồng địa phương',
      ],
      views: 1800,
      likes: 950,
    },
  ];

  // Travel Blog Team
  const blogPosts = [
    {
      id: 1,
      title: 'Phỏng vấn Travel Blogger: Kinh nghiệm 10 năm du lịch',
      author: 'Vũ Thị Mai',
      avatar: '✍️',
      avatarUrl: '/uploads/avatars/ha-noi.jpg',
      date: '28/01/2025',
      category: 'Blog',
      image: '🎤',
      imageUrl: '/uploads/destinations/Combo Hà Nội - Hạ Long.jpg',
      content: 'Cuộc trò chuyện với blogger du lịch hàng đầu về những kinh nghiệm quý báu trong 10 năm khám phá thế giới. Từ những sai lầm ban đầu đến những bài học đắt giá, tất cả đều được chia sẻ trong bài viết này.',
      views: 5400,
      likes: 2100,
    },
    {
      id: 2,
      title: 'Xu hướng du lịch 2025: Sustainable Travel',
      author: 'Nguyễn Văn Quang',
      avatar: '✍️',
      avatarUrl: '/uploads/avatars/nha-trang.jpg',
      date: '26/01/2025',
      category: 'Blog',
      image: '🌍',
      imageUrl: '/uploads/destinations/Nha Trang 3N2Đ.jpg',
      content: 'Khám phá xu hướng du lịch bền vững đang được quan tâm trong năm 2025. Từ việc giảm carbon footprint, hỗ trợ cộng đồng địa phương đến tôn trọng môi trường, du lịch bền vững là tương lai của ngành du lịch.',
      views: 3800,
      likes: 1650,
    },
    {
      id: 3,
      title: 'Top 10 điểm đến hot nhất Việt Nam 2025',
      author: 'Trần Thị Hương',
      avatar: '✍️',
      avatarUrl: '/uploads/avatars/hoi-an.png',
      date: '24/01/2025',
      category: 'Blog',
      image: '🏆',
      imageUrl: '/uploads/destinations/Hội An - Đà Nẵng.jpg',
      content: 'Danh sách top 10 điểm đến hot nhất Việt Nam trong năm 2025. Từ những thành phố cổ kính đến những bãi biển tuyệt đẹp, Việt Nam có rất nhiều điều để khám phá.',
      views: 4200,
      likes: 1880,
    },
    {
      id: 4,
      title: 'Du lịch một mình - Trải nghiệm tự do',
      author: 'Lê Văn Đức',
      avatar: '✍️',
      avatarUrl: '/uploads/avatars/da-lat.jpg',
      date: '22/01/2025',
      category: 'Blog',
      image: '🚶',
      imageUrl: '/uploads/destinations/Tour-Da-Lat-3-Ngay-2-Dem.png',
      content: 'Du lịch một mình không phải là cô đơn, mà là tự do. Bài viết chia sẻ về những trải nghiệm, lợi ích và cách chuẩn bị cho chuyến đi một mình đáng nhớ.',
      views: 3600,
      likes: 1520,
    },
    {
      id: 5,
      title: 'Ẩm thực đường phố Việt Nam - Hành trình khám phá',
      author: 'Phạm Thị Lan',
      avatar: '✍️',
      avatarUrl: '/uploads/avatars/phu-quoc.jpg',
      date: '20/01/2025',
      category: 'Blog',
      image: '🍜',
      imageUrl: '/uploads/destinations/Combo Hà Nội - Hạ Long.jpg',
      content: 'Hành trình khám phá ẩm thực đường phố Việt Nam từ Bắc vào Nam. Từ phở Hà Nội, bún bò Huế, đến bánh mì Sài Gòn, mỗi món đều có hương vị riêng.',
      views: 4800,
      likes: 2200,
    },
    {
      id: 6,
      title: 'Tips du lịch tiết kiệm cho người trẻ',
      author: 'Hoàng Văn Tuấn',
      avatar: '✍️',
      avatarUrl: '/uploads/avatars/sapa.jpg',
      date: '18/01/2025',
      category: 'Blog',
      image: '💰',
      imageUrl: '/uploads/destinations/Sapa Trekking 2N1Đ.jpg',
      content: 'Bí kíp du lịch tiết kiệm dành cho người trẻ. Từ cách săn vé rẻ, chọn homestay, ăn uống địa phương đến tận dụng các chương trình khuyến mãi.',
      views: 3900,
      likes: 1750,
    },
    {
      id: 7,
      title: 'Du lịch cùng gia đình - Kỷ niệm đáng nhớ',
      author: 'Đỗ Thị Hoa',
      avatar: '✍️',
      avatarUrl: '/uploads/avatars/nha-trang.jpg',
      date: '16/01/2025',
      category: 'Blog',
      image: '👨‍👩‍👧‍👦',
      imageUrl: '/uploads/destinations/Nha Trang 3N2Đ.jpg',
      content: 'Chia sẻ kinh nghiệm du lịch cùng gia đình với trẻ nhỏ. Từ việc chọn điểm đến phù hợp, chuẩn bị đồ đạc đến cách giữ an toàn cho trẻ em.',
      views: 3500,
      likes: 1400,
    },
    {
      id: 8,
      title: 'Văn hóa và lịch sử Việt Nam qua các điểm đến',
      author: 'Bùi Văn Thành',
      avatar: '✍️',
      avatarUrl: '/uploads/avatars/hue.jpg',
      date: '14/01/2025',
      category: 'Blog',
      image: '🏛️',
      imageUrl: '/uploads/destinations/combo-da-nang-hoi-an.jpg',
      content: 'Khám phá văn hóa và lịch sử Việt Nam qua các điểm đến nổi tiếng. Từ cố đô Huế, phố cổ Hội An đến thành phố Hà Nội, mỗi nơi đều mang một câu chuyện riêng.',
      views: 4100,
      likes: 1900,
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
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-teal-500 to-sky-500 text-white py-16">
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
            {Array.from({ length: 9 }).map((_, i) => (
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
                  <div className="relative h-72 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center text-7xl overflow-hidden">
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
                      story.image || '🖼️'
                    )}
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
                        {story.avatarUrl ? (
                          <img src={story.avatarUrl} alt={story.author} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {story.avatar}
                          </div>
                        )}
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
            {story.avatarUrl ? (
              <img src={story.avatarUrl} alt={story.author} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {story.avatar}
              </div>
            )}
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
          {review.user.avatarUrl ? (
            <img src={review.user.avatarUrl} alt={review.user.name || 'User'} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {(review.user.name || review.user.email || 'U')[0].toUpperCase()}
            </div>
          )}
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