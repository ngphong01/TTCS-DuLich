import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from './i18n/I18nProvider';
import { ThemeProvider } from './contexts/ThemeContext';
// Keep LanguageProvider for backward compatibility during migration
import { LanguageProvider } from './contexts/LanguageContext';
import i18n from './i18n/config';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LiveChat from './components/LiveChat';
import TravelGoChatbot from './components/TravelGoChatbot';
import GoogleAnalytics from './components/GoogleAnalytics';
import FacebookPixel from './components/FacebookPixel';
import PromoPopup from './components/PromoPopup';
import ZaloOA from './components/ZaloOA';
import TawkTo from './components/TawkTo';
import { HelmetProvider } from 'react-helmet-async';
import Skeleton from './components/Skeleton';

// 🔥 PRIORITY: Tours & TourDetail - Load immediately (eager loading) for better performance
import TourDetail from './pages/TourDetail';
import Home from './pages/Home';

// Other pages - Lazy load for code splitting
const Destinations = lazy(() => import('./pages/Destinations'));
const DestinationDetail = lazy(() => import('./pages/DestinationDetail'));
const Hotels = lazy(() => import('./pages/Hotels'));
const Restaurants = lazy(() => import('./pages/Restaurants'));
const HotelDetail = lazy(() => import('./pages/HotelDetail'));
const RestaurantDetail = lazy(() => import('./pages/RestaurantDetail'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Categories = lazy(() => import('./pages/Categories'));
const Featured = lazy(() => import('./pages/Featured'));
const Stories = lazy(() => import('./pages/Stories'));
const Deals = lazy(() => import('./pages/Deals'));
const PromoCodes = lazy(() => import('./pages/PromoCodes'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));
const FeaturedStories = lazy(() => import('./pages/FeaturedStories'));
const About = lazy(() => import('./pages/About'));
const SignIn = lazy(() => import('./pages/auth/SignIn'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Verify = lazy(() => import('./pages/auth/Verify'));
const SimpleLogin = lazy(() => import('./pages/auth/SimpleLogin'));
const SimpleRegister = lazy(() => import('./pages/auth/SimpleRegister'));
const SignOut = lazy(() => import('./pages/auth/SignOut'));
const Checkout = lazy(() => import('./pages/checkout/Checkout'));
const PayPalSuccess = lazy(() => import('./pages/checkout/PayPalSuccess'));
const PayPalCancel = lazy(() => import('./pages/checkout/PayPalCancel'));
const Orders = lazy(() => import('./pages/Orders'));
import ProtectedRoute from './components/ProtectedRoute';
import AccountLayout from './layouts/AccountLayout';
import AccountPage from './pages/Account';
import Profile from './pages/account/Profile';
import Bookings from './pages/account/Bookings';
import Payments from './pages/account/Payments';
import Wishlist from './pages/account/Wishlist';
import Reviews from './pages/account/Reviews';
import Notifications from './pages/account/Notifications';
import Loyalty from './pages/account/Loyalty';
import Support from './pages/account/Support';
import Settings from './pages/account/Settings';
import ChangePassword from './pages/account/ChangePassword';
import Security from './pages/account/Security';

// Admin imports
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDestinations from './pages/admin/AdminDestinations';
import AdminTours from './pages/admin/AdminTours';
import AdminHotels from './pages/admin/AdminHotels';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminBookings from './pages/admin/AdminBookings';
import AdminReviews from './pages/admin/AdminReviews';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminBanners from './pages/admin/AdminBanners';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Simple placeholder pages

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0, // Always fetch fresh data
      gcTime: 0, // Don't cache
    },
  },
});

function AppContent() {
  const location = useLocation();
  
  // 🔥 CRITICAL: Detect language from URL path và sync với react-i18next
  const supportedCodes = ['vi', 'en', 'fr', 'ja', 'ko', 'zh-CN', 'zh-TW', 'de', 'es', 'th'];
  let pathname = location.pathname;
  const langPrefix = pathname.split('/')[1];
  
  // 🔥 CRITICAL: Sync language từ URL path với react-i18next khi location thay đổi
  useEffect(() => {
    if (supportedCodes.includes(langPrefix)) {
      const detectedLang = langPrefix as typeof supportedCodes[number];
      const currentLang = i18n.language || localStorage.getItem('travelgo:language') || 'en';
      
      // Nếu language trong URL khác với current language, sync lại
      if (currentLang !== detectedLang) {
        localStorage.setItem('travelgo:language', detectedLang);
        localStorage.setItem('language', detectedLang);
        i18n.changeLanguage(detectedLang).then(() => {
          window.dispatchEvent(new CustomEvent('languageChanged', { detail: detectedLang }));
          document.documentElement.lang = detectedLang;
        });
      }
    }
  }, [location.pathname, langPrefix]);
  
  // Strip language prefix từ pathname để router match đúng routes
  if (supportedCodes.includes(langPrefix)) {
    pathname = '/' + pathname.split('/').slice(2).join('/') || '/';
  }
  
  // Routes không hiển thị NavBar và Footer
  const authRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password', '/simple-login', '/simple-register'];
  const adminRoutes = ['/admin'];
  const isAuthPage = authRoutes.some(route => pathname.startsWith(route));
  const isAdminPage = adminRoutes.some(route => pathname.startsWith(route));
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && !isAdminPage && <NavBar />}
      <main className="flex-1 w-full mx-auto">
        <Routes>
          {/* Routes without language prefix - Tours first for better performance */}
          <Route path="/" element={<Home />} />
          {/* 🔥 PRIORITY: Tours & TourDetail - Load immediately (no Suspense) */}
          <Route path="/tours/:slug" element={<TourDetail />} />
          
          {/* Other routes - Lazy loaded with Suspense */}
          <Route path="/destinations/:slug" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <DestinationDetail />
            </Suspense>
          } />
          <Route path="/destinations" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Destinations />
            </Suspense>
          } />
          <Route path="/hotels/:slug" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <HotelDetail />
            </Suspense>
          } />
          <Route path="/hotels" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Hotels />
            </Suspense>
          } />
          <Route path="/restaurants/:slug" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <RestaurantDetail />
            </Suspense>
          } />
          <Route path="/restaurants" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Restaurants />
            </Suspense>
          } />
          <Route path="/blog" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <BlogList />
            </Suspense>
          } />
          <Route path="/blog/:slug" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <BlogDetail />
            </Suspense>
          } />
          <Route path="/categories" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Categories />
            </Suspense>
          } />
          <Route path="/featured" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Featured />
            </Suspense>
          } />
          <Route path="/stories" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Stories />
            </Suspense>
          } />
          <Route path="/featured-stories" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <FeaturedStories />
            </Suspense>
          } />
          <Route path="/deals" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Deals />
            </Suspense>
          } />
          <Route path="/promo-codes" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <PromoCodes />
            </Suspense>
          } />
          <Route path="/about" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <About />
            </Suspense>
          } />
          <Route path="/contact" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Contact />
            </Suspense>
          } />
          <Route path="/signin" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <SignIn />
            </Suspense>
          } />
          <Route path="/signup" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <SignUp />
            </Suspense>
          } />
          <Route path="/signout" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <SignOut />
            </Suspense>
          } />
          <Route path="/forgot-password" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <ForgotPassword />
            </Suspense>
          } />
          <Route path="/reset-password" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <ResetPassword />
            </Suspense>
          } />
          <Route path="/verify" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Verify />
            </Suspense>
          } />
          <Route path="/simple-login" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <SimpleLogin />
            </Suspense>
          } />
          <Route path="/simple-register" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <SimpleRegister />
            </Suspense>
          } />
          <Route path="/checkout" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Checkout />
            </Suspense>
          } />
          <Route path="/checkout/paypal/success" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <PayPalSuccess />
            </Suspense>
          } />
          <Route path="/checkout/paypal/cancel" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <PayPalCancel />
            </Suspense>
          } />
          <Route path="/orders" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Orders />
            </Suspense>
          } />
          
          {/* 🔥 CRITICAL: Routes with language prefix - Tours first for better performance */}
          <Route path="/:lang" element={<Home />} />
          {/* 🔥 PRIORITY: Tours & TourDetail - Load immediately (no Suspense) */}
          <Route path="/:lang/tours/:slug" element={<TourDetail />} />
          
          {/* Other routes - Lazy loaded with Suspense */}
          <Route path="/:lang/destinations/:slug" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <DestinationDetail />
            </Suspense>
          } />
          <Route path="/:lang/destinations" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Destinations />
            </Suspense>
          } />
          <Route path="/:lang/hotels/:slug" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <HotelDetail />
            </Suspense>
          } />
          <Route path="/:lang/hotels" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Hotels />
            </Suspense>
          } />
          <Route path="/:lang/restaurants/:slug" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <RestaurantDetail />
            </Suspense>
          } />
          <Route path="/:lang/restaurants" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Restaurants />
            </Suspense>
          } />
          <Route path="/:lang/blog" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <BlogList />
            </Suspense>
          } />
          <Route path="/:lang/blog/:slug" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <BlogDetail />
            </Suspense>
          } />
          <Route path="/:lang/categories" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Categories />
            </Suspense>
          } />
          <Route path="/:lang/featured" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Featured />
            </Suspense>
          } />
          <Route path="/:lang/stories" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Stories />
            </Suspense>
          } />
          <Route path="/:lang/featured-stories" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <FeaturedStories />
            </Suspense>
          } />
          <Route path="/:lang/deals" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Deals />
            </Suspense>
          } />
          <Route path="/:lang/promo-codes" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <PromoCodes />
            </Suspense>
          } />
          <Route path="/:lang/about" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <About />
            </Suspense>
          } />
          <Route path="/:lang/contact" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Contact />
            </Suspense>
          } />
          <Route path="/:lang/signin" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <SignIn />
            </Suspense>
          } />
          <Route path="/:lang/signup" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <SignUp />
            </Suspense>
          } />
          <Route path="/:lang/checkout" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Checkout />
            </Suspense>
          } />
          <Route path="/:lang/orders" element={
            <Suspense fallback={<Skeleton className="h-screen w-full" />}>
              <Orders />
            </Suspense>
          } />
          
          {/* Account Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountPage />} />
            <Route element={<AccountLayout />}>
              <Route path="/account/profile" element={<Profile />} />
              <Route path="/account/bookings" element={<Bookings />} />
              <Route path="/account/payments" element={<Payments />} />
              <Route path="/account/wishlist" element={<Wishlist />} />
              <Route path="/account/reviews" element={<Reviews />} />
              <Route path="/account/notifications" element={<Notifications />} />
              <Route path="/account/loyalty" element={<Loyalty />} />
              <Route path="/account/support" element={<Support />} />
              <Route path="/account/settings" element={<Settings />} />
              <Route path="/account/password" element={<ChangePassword />} />
              <Route path="/account/security" element={<Security />} />
            </Route>
          </Route>
          
          {/* Account Routes with language prefix */}
          <Route element={<ProtectedRoute />}>
            <Route path="/:lang/account" element={<AccountPage />} />
            <Route element={<AccountLayout />}>
              <Route path="/:lang/account/profile" element={<Profile />} />
              <Route path="/:lang/account/bookings" element={<Bookings />} />
              <Route path="/:lang/account/payments" element={<Payments />} />
              <Route path="/:lang/account/wishlist" element={<Wishlist />} />
              <Route path="/:lang/account/reviews" element={<Reviews />} />
              <Route path="/:lang/account/notifications" element={<Notifications />} />
              <Route path="/:lang/account/loyalty" element={<Loyalty />} />
              <Route path="/:lang/account/support" element={<Support />} />
              <Route path="/:lang/account/settings" element={<Settings />} />
              <Route path="/:lang/account/password" element={<ChangePassword />} />
              <Route path="/:lang/account/security" element={<Security />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/destinations" element={<AdminDestinations />} />
              <Route path="/admin/tours" element={<AdminTours />} />
              <Route path="/admin/hotels" element={<AdminHotels />} />
              <Route path="/admin/restaurants" element={<AdminRestaurants />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
                  <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/promo" element={<AdminPromoCodes />} />
            <Route path="/admin/blogs" element={<AdminBlogs />} />
            <Route path="/admin/banners" element={<AdminBanners />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}
      {/* Chỉ hiển thị TravelGoChatbot (chatbot mới đẹp hơn), ẩn LiveChat cũ */}
      {!isAuthPage && !isAdminPage && <TravelGoChatbot />}
      {/* Analytics & Marketing */}
      <GoogleAnalytics measurementId={process.env.REACT_APP_GA_MEASUREMENT_ID} />
      <FacebookPixel pixelId={process.env.REACT_APP_FB_PIXEL_ID} />
      {/* Third-party integrations */}
      <ZaloOA oaId={process.env.REACT_APP_ZALO_OA_ID} />
      <TawkTo 
        propertyId={process.env.REACT_APP_TAWKTO_PROPERTY_ID} 
        widgetId={process.env.REACT_APP_TAWKTO_WIDGET_ID} 
      />
      {/* Promo Popup */}
      {!isAuthPage && !isAdminPage && (
        <PromoPopup
          title="🎉 Ưu đãi đặc biệt!"
          message="Nhận ngay ưu đãi hấp dẫn cho chuyến du lịch của bạn"
          discount="Giảm 20%"
          code="TRAVEL20"
          linkUrl="/deals"
          linkText="Xem ngay"
          showDays={7}
        />
      )}
    </div>
  );
}

function App(): JSX.Element {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <LanguageProvider>
            <ThemeProvider>
              <Router>
                <AppContent />
              </Router>
            </ThemeProvider>
          </LanguageProvider>
        </I18nProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
