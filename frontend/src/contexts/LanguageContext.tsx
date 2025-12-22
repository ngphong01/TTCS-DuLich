import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Navigation
    'nav.home': 'Trang chủ',
    'nav.destinations': 'Điểm đến',
    'nav.tours': 'Tour',
    'nav.hotels': 'Khách sạn',
    'nav.restaurants': 'Nhà hàng',
    'nav.blog': 'Blog',
    'nav.contact': 'Liên hệ',
    'nav.about': 'Về chúng tôi',
    'nav.signin': 'Đăng nhập',
    'nav.signup': 'Đăng ký',
    'nav.account': 'Tài khoản',
    'nav.logout': 'Đăng xuất',
    'nav.admin': 'Quản trị',

    // Search
    'search.placeholder': 'Tìm kiếm điểm đến, tour, khách sạn...',
    'search.button': 'Tìm kiếm',

    // Home
    'home.hero.title': 'Khám Phá Thế Giới Cùng TravelGo',
    'home.hero.subtitle': 'Hơn 1000+ điểm đến tuyệt vời đang chờ bạn',
    'home.hero.cta': 'Khám phá ngay',
    'home.featured.title': 'Điểm đến nổi bật',
    'home.tours.title': 'Tour du lịch hot',
    'home.deals.title': 'Ưu đãi đặc biệt',

    // Common
    'common.viewAll': 'Xem tất cả',
    'common.viewDetails': 'Xem chi tiết',
    'common.book': 'Đặt ngay',
    'common.reserve': 'Đặt chỗ',
    'common.from': 'Từ',
    'common.perNight': 'mỗi đêm',
    'common.perPerson': 'mỗi người',
    'common.night': 'đêm',
    'common.day': 'ngày',
    'common.adults': 'Người lớn',
    'common.children': 'Trẻ em',
    'common.guests': 'Khách',
    'common.checkIn': 'Nhận phòng',
    'common.checkOut': 'Trả phòng',
    'common.total': 'Tổng cộng',
    'common.discount': 'Giảm giá',
    'common.serviceFee': 'Phí dịch vụ',
    'common.loading': 'Đang tải...',
    'common.error': 'Đã có lỗi xảy ra',
    'common.notFound': 'Không tìm thấy',

    // Tour
    'tour.duration': 'Thời gian',
    'tour.rating': 'Đánh giá',
    'tour.reviews': 'đánh giá',
    'tour.highlights': 'Điểm nổi bật',
    'tour.itinerary': 'Lịch trình',
    'tour.included': 'Bao gồm',
    'tour.notIncluded': 'Không bao gồm',
    'tour.policies': 'Chính sách',
    'tour.overview': 'Tổng quan',
    'tour.selectDate': 'Chọn ngày khởi hành',
    'tour.participants': 'Số người tham gia',

    // Hotel
    'hotel.amenities': 'Tiện nghi',
    'hotel.features': 'Đặc điểm nổi bật',
    'hotel.contact': 'Thông tin liên hệ',
    'hotel.pricePerNight': 'giá mỗi đêm',
    'hotel.nights': 'số đêm',

    // Restaurant
    'restaurant.cuisine': 'Ẩm thực',
    'restaurant.priceRange': 'Khoảng giá',
    'restaurant.openingHours': 'Giờ mở cửa',
    'restaurant.reservation': 'Đặt bàn',
    'restaurant.partySize': 'Số người',
    'restaurant.selectTime': 'Chọn giờ',

    // Footer
    'footer.about': 'Về TravelGo',
    'footer.description': 'Nền tảng du lịch hàng đầu Việt Nam',
    'footer.quickLinks': 'Liên kết nhanh',
    'footer.support': 'Hỗ trợ',
    'footer.followUs': 'Theo dõi chúng tôi',
    'footer.newsletter': 'Đăng ký nhận tin',
    'footer.newsletterPlaceholder': 'Email của bạn',
    'footer.subscribe': 'Đăng ký',
    'footer.copyright': '© 2024 TravelGo. All rights reserved.',

    // Language
    'language.select': 'Chọn ngôn ngữ',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.destinations': 'Destinations',
    'nav.tours': 'Tours',
    'nav.hotels': 'Hotels',
    'nav.restaurants': 'Restaurants',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.about': 'About Us',
    'nav.signin': 'Sign In',
    'nav.signup': 'Sign Up',
    'nav.account': 'Account',
    'nav.logout': 'Logout',
    'nav.admin': 'Admin',

    // Search
    'search.placeholder': 'Search destinations, tours, hotels...',
    'search.button': 'Search',

    // Home
    'home.hero.title': 'Explore the World with TravelGo',
    'home.hero.subtitle': 'Over 1000+ amazing destinations await you',
    'home.hero.cta': 'Explore Now',
    'home.featured.title': 'Featured Destinations',
    'home.tours.title': 'Hot Tours',
    'home.deals.title': 'Special Deals',

    // Common
    'common.viewAll': 'View All',
    'common.viewDetails': 'View Details',
    'common.book': 'Book Now',
    'common.reserve': 'Reserve',
    'common.from': 'From',
    'common.perNight': 'per night',
    'common.perPerson': 'per person',
    'common.night': 'night',
    'common.day': 'day',
    'common.adults': 'Adults',
    'common.children': 'Children',
    'common.guests': 'Guests',
    'common.checkIn': 'Check-in',
    'common.checkOut': 'Check-out',
    'common.total': 'Total',
    'common.discount': 'Discount',
    'common.serviceFee': 'Service Fee',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.notFound': 'Not Found',

    // Tour
    'tour.duration': 'Duration',
    'tour.rating': 'Rating',
    'tour.reviews': 'reviews',
    'tour.highlights': 'Highlights',
    'tour.itinerary': 'Itinerary',
    'tour.included': "What's Included",
    'tour.notIncluded': 'Not Included',
    'tour.policies': 'Policies',
    'tour.overview': 'Overview',
    'tour.selectDate': 'Select departure date',
    'tour.participants': 'Number of participants',

    // Hotel
    'hotel.amenities': 'Amenities',
    'hotel.features': 'Unique Features',
    'hotel.contact': 'Contact Information',
    'hotel.pricePerNight': 'per night',
    'hotel.nights': 'nights',

    // Restaurant
    'restaurant.cuisine': 'Cuisine',
    'restaurant.priceRange': 'Price Range',
    'restaurant.openingHours': 'Opening Hours',
    'restaurant.reservation': 'Make a Reservation',
    'restaurant.partySize': 'Party Size',
    'restaurant.selectTime': 'Select Time',

    // Footer
    'footer.about': 'About TravelGo',
    'footer.description': 'Leading travel platform in Vietnam',
    'footer.quickLinks': 'Quick Links',
    'footer.support': 'Support',
    'footer.followUs': 'Follow Us',
    'footer.newsletter': 'Subscribe to Newsletter',
    'footer.newsletterPlaceholder': 'Your email',
    'footer.subscribe': 'Subscribe',
    'footer.copyright': '© 2024 TravelGo. All rights reserved.',

    // Language
    'language.select': 'Select Language',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage - check both keys for compatibility
    const saved = localStorage.getItem('travelgo:language') || localStorage.getItem('language') as Language;
    return (saved === 'vi' || saved === 'en') ? saved : 'vi';
  });

  // 🔥 CRITICAL: Lắng nghe languageChanged event từ react-i18next
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLang = event.detail as Language;
      if (newLang === 'vi' || newLang === 'en') {
        setLanguageState(newLang);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  useEffect(() => {
    // Save to both localStorage keys for compatibility
    localStorage.setItem('travelgo:language', language);
    localStorage.setItem('language', language);
    // Update HTML lang attribute
    document.documentElement.lang = language;
    // Trigger custom event for other contexts to sync
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

