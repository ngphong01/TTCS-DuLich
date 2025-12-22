// frontend/src/components/CheckInSection.tsx
import { useState, useEffect } from 'react';
import { MapPinIcon, CameraIcon, ShareIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import { getDestinations } from '../services/destination';
import { getDestinationImageUrl } from '../utils/imageHelper';
import { useTranslation } from 'react-i18next';

interface CheckIn {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  destination: string;
  image: string;
  location: string;
  time: string;
  likes: number;
  isLiked: boolean;
}

interface CheckInSectionProps {
  checkIns?: CheckIn[];
}

export default function CheckInSection({ checkIns }: CheckInSectionProps) {
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const { i18n } = useTranslation();
  
  // Fetch destinations từ API để lấy ảnh thực tế
  const { data: destinationsData } = useQuery({
    queryKey: ['destinations-for-checkin', i18n.language],
    queryFn: () => getDestinations(),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  // Danh sách tên thật của khách hàng
  const realNames = [
    'Nguyễn Văn An',
    'Trần Thị Mai',
    'Lê Hoàng Nam',
    'Phạm Thu Hằng',
    'Đặng Minh Quân',
    'Vũ Thị Lan Anh',
    'Bùi Quốc Khánh',
    'Hoàng Ngọc Diệp',
    'Đỗ Thanh Tùng',
    'Nguyễn Thị Kim Oanh',
    'Trương Hải Long',
    'Phan Minh Đức',
    'Lương Thị Bích Ngọc',
    'Cao Văn Phúc',
    'Mai Anh Tuấn',
  ];

  // Danh sách điểm đến phổ biến với location
  const destinationLocations: Record<string, string> = {
    'Hạ Long': 'Quảng Ninh, Việt Nam',
    'Hạ Long Bay': 'Quảng Ninh, Việt Nam',
    'Phú Quốc': 'Kiên Giang, Việt Nam',
    'Đà Lạt': 'Lâm Đồng, Việt Nam',
    'Hội An': 'Quảng Nam, Việt Nam',
    'Sa Pa': 'Lào Cai, Việt Nam',
    'Sapa': 'Lào Cai, Việt Nam',
    'Nha Trang': 'Khánh Hòa, Việt Nam',
    'Huế': 'Thừa Thiên Huế, Việt Nam',
    'Mũi Né': 'Bình Thuận, Việt Nam',
    'Cát Bà': 'Hải Phòng, Việt Nam',
    'Vịnh Hạ Long': 'Quảng Ninh, Việt Nam',
    'Hà Nội': 'Hà Nội, Việt Nam',
    'Đà Nẵng': 'Đà Nẵng, Việt Nam',
    'Hồ Chí Minh': 'Hồ Chí Minh, Việt Nam',
  };

  // Lấy ảnh thực tế từ destinations trong database
  const getDestinationImage = (destinationName: string): string => {
    // Nếu chưa có data từ API, dùng ảnh theo tên điểm đến trên Unsplash
    if (!destinationsData || !Array.isArray(destinationsData)) {
      const searchQuery = encodeURIComponent(destinationName);
      return `https://source.unsplash.com/featured/800x600/?${searchQuery},travel`;
    }

    // Tìm destination trong database theo tên
    const destination = destinationsData.find((d: any) => 
      d.name === destinationName || 
      d.name.includes(destinationName) ||
      destinationName.includes(d.name)
    );

    if (destination) {
      const imageUrl = getDestinationImageUrl(destination);
      if (imageUrl) {
        return imageUrl;
      }
    }

    // Fallback cuối: dùng ảnh theo tên điểm đến trên Unsplash
    const searchQuery = encodeURIComponent(destinationName);
    return `https://source.unsplash.com/featured/800x600/?${searchQuery},travel`;
  };

  // Danh sách tên điểm đến phổ biến
  const popularDestinations = [
    'Hạ Long', 'Phú Quốc', 'Đà Lạt', 'Hội An', 'Sa Pa', 
    'Nha Trang', 'Huế', 'Hà Nội', 'Đà Nẵng'
  ];

  // Tạo check-ins với tên thật và ảnh thực tế
  const generateCheckIns = (): CheckIn[] => {
    const times = ['2 giờ trước', '5 giờ trước', '1 ngày trước', '2 ngày trước', '3 ngày trước', '1 tuần trước'];
    const baseLikes = [89, 124, 156, 203, 267, 189, 145, 178, 234, 198];
    
    return realNames.slice(0, 9).map((name, index) => {
      const destIndex = index % popularDestinations.length;
      const destinationName = popularDestinations[destIndex];
      const timeIndex = index % times.length;
      const likesIndex = index % baseLikes.length;
      
      // Lấy location từ map hoặc fallback
      const location = destinationLocations[destinationName] || `${destinationName}, Việt Nam`;
      
      // Lấy ảnh thực tế từ database
      const imageUrl = getDestinationImage(destinationName);
      
      return {
        id: index + 1,
        user: {
          name: name,
          // Dùng avatar trung tính theo tên, không phụ thuộc dịch vụ random giới tính
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563EB&color=ffffff&size=80&rounded=true`
        },
        destination: destinationName,
        image: imageUrl,
        location: location,
        time: times[timeIndex],
        likes: baseLikes[likesIndex],
        isLiked: false,
      };
    });
  };

  // Mock data if not provided
  const defaultCheckIns: CheckIn[] = checkIns || generateCheckIns();

  const handleLike = (id: number) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <CameraIcon className="h-5 w-5" />
            Check-in thực tế
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Khách hàng đang <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">khám phá</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Xem những khoảnh khắc đẹp từ hành trình thực tế của khách hàng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {defaultCheckIns.map((checkIn) => {
            const isLiked = likedItems.has(checkIn.id);
            return (
              <div
                key={checkIn.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={checkIn.image}
                    alt={checkIn.destination}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Location Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <MapPinIcon className="h-4 w-4 text-blue-600" />
                    {checkIn.location}
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(checkIn.id)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors"
                  >
                    {isLiked ? (
                      <HeartIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-700" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={checkIn.user.avatar}
                      alt={checkIn.user.name}
                      className="w-10 h-10 rounded-full border-2 border-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{checkIn.user.name}</p>
                      <p className="text-sm text-gray-500">{checkIn.time}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{checkIn.destination}</h3>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <HeartIconSolid className={`h-5 w-5 ${isLiked ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className="font-semibold">{checkIn.likes + (isLiked ? 1 : 0)}</span>
                    </div>
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
                      <ShareIcon className="h-5 w-5" />
                      Chia sẻ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all transform hover:scale-105">
            Xem thêm check-in
          </button>
        </div>
      </div>
    </section>
  );
}

