import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';

// Import pages
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Categories from './pages/Categories';
import Featured from './pages/Featured';
import Stories from './pages/Stories';
import Deals from './pages/Deals';
import Contact from './pages/Contact';
import About from './pages/About';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Verify from './pages/auth/Verify';
import SimpleLogin from './pages/auth/SimpleLogin';
import SimpleRegister from './pages/auth/SimpleRegister';
import SignOut from './pages/auth/SignOut';
import Checkout from './pages/checkout/Checkout';
import Orders from './pages/Orders';
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
import AdminBookings from './pages/admin/AdminBookings';
import AdminReviews from './pages/admin/AdminReviews';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';

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
  
  // Routes không hiển thị NavBar và Footer
  const authRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password', '/simple-login', '/simple-register'];
  const adminRoutes = ['/admin'];
  const isAuthPage = authRoutes.some(route => location.pathname.startsWith(route));
  const isAdminPage = adminRoutes.some(route => location.pathname.startsWith(route));
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && !isAdminPage && <NavBar />}
      <main className="flex-1 w-full mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:slug" element={<DestinationDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/featured" element={<Featured />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signout" element={<SignOut />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/simple-login" element={<SimpleLogin />} />
          <Route path="/simple-register" element={<SimpleRegister />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          
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

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/destinations" element={<AdminDestinations />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}
    </div>
  );
}

function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
