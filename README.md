# TravelGo — Monorepo (Backend + Frontend)

TravelGo là ứng dụng du lịch SPA đa trang gồm:
- Backend: Node.js + Express + Prisma + MySQL + JWT
- Frontend: React + TypeScript + Tailwind CSS + React Router + React Query (không dùng Vite)

Dự án đã có:
- Hệ thống Auth (JWT) với đăng ký/đăng nhập
- Khu vực tài khoản người dùng (Account) lấy dữ liệu thật
- Trang quản trị (Admin) có dashboard và CRUD Destinations cơ bản (create/edit/delete, pagination)
- Public pages: Home, Destinations, Destination Detail, Categories, Deals, Stories, Story Detail, Contact, About

---

## 1) Kiến trúc thư mục

- Backend gốc repo:
  - index.js, routes/*, middleware/auth.js, lib/prisma.js, prisma/schema.prisma, prisma/seed.js
- Frontend:
  - frontend/src/* (App.tsx, pages, layouts, components, hooks, services, lib)

---

## 2) Backend

Công nghệ:
- Express 5, Prisma ORM, MySQL
- JWT (jsonwebtoken), bcryptjs
- CORS, dotenv

Schema (Prisma):
- User, Destination, Booking, Payment, Review, Notification, Wishlist, Loyalty, Category, SupportTicket
- Enums: Role, BookingStatus, PaymentStatus

Auth:
- POST /api/auth/register
- POST /api/auth/login
- JWT trả về lưu ở localStorage (FE), header Authorization: Bearer <token>

Admin guard:
- Tất cả /api/admin/* được bảo vệ bởi middleware authRequired + isAdmin

Các nhóm API chính đã có:
- Auth: /api/auth/...
- User: /api/user/:id (GET/PUT), /api/user/:id/settings (PUT), /api/user/:id/password (PUT)
- Destination:
  - GET /api/destination (hỗ trợ pagination: ?page=&pageSize=)
  - GET /api/destination/featured
  - GET /api/destination/:slug
  - POST /api/destination (Admin)
  - PUT /api/destination/:id (Admin)
  - DELETE /api/destination/:id (Admin)
- Booking:
  - POST /api/booking
  - GET /api/booking/user/:id
- Payment:
  - POST /api/payment/create (stub)
  - GET /api/payment/:id
  - GET /api/payment/user/:id
- Review:
  - GET /api/review/:destinationId
  - GET /api/review/user/:id
- Notification:
  - GET /api/notification/user/:id
- Wishlist:
  - GET /api/wishlist/user/:id
- Loyalty:
  - GET /api/loyalty/:userId
- Admin:
  - GET /api/admin/summary (doanh thu, total bookings/users/destinations)
  - GET /api/admin/users
  - GET /api/admin/bookings
  - GET /api/admin/reviews
  - GET /api/admin/payments
  - GET /api/admin/settings

Seed mặc định:
- Admin: admin@travelgo.dev / admin123
- Categories: Beach, Adventure
- Destinations: Bali (featured), Phu Quoc (featured), Sa Pa

---

## 3) Frontend

Công nghệ:
- React 18 + TypeScript
- React Router v6 (SPA nhiều route)
- Tailwind CSS
- @tanstack/react-query (data fetching/caching)
- axios (HTTP client)
- react-hot-toast (toast)

Cấu trúc Layout:
- PublicLayout: header/footer + các trang public
- AccountLayout: sidebar tài khoản (protected)
- AdminLayout: sidebar admin (guard admin)

Guard:
- ProtectedRoute: chặn /account/* khi chưa đăng nhập
- AdminRoute: chặn /admin/* nếu không có quyền ADMIN

Public pages:
- / (Home): banner + Featured Destinations (gọi /api/destination/featured)
- /destinations: danh sách điểm đến, có Pagination (client), Skeleton
- /destinations/:slug: chi tiết (stub UI, đã có service)
- /categories, /deals, /stories, /stories/:slug, /contact, /about

Auth pages:
- /signin: form đăng nhập, lưu JWT, chuyển hướng về /account/profile
- /signup, /forgot-password, /reset-password/:token, /auth/callback/:provider, /auth/success, /auth/error (stub UI)

Account pages (đã kết nối API + UI cơ bản):
- /account/profile: lấy user hiện tại từ JWT, gọi /api/user/:id
- /account/bookings: bảng lịch sử booking (GET /api/booking/user/:id)
- /account/payments: bảng giao dịch (GET /api/payment/user/:id)
- /account/wishlist: bảng wishlist + link tới destination (GET /api/wishlist/user/:id)
- /account/reviews: bảng review của tôi (GET /api/review/user/:id)
- /account/notifications: bảng thông báo (GET /api/notification/user/:id)
- /account/loyalty: hiển thị điểm tích lũy (GET /api/loyalty/:userId)
- /account/support, /account/settings, /account/password, /account/security (stub UI)

Admin pages:
- /admin/dashboard: card thống kê (GET /api/admin/summary)
- /admin/users: bảng người dùng (GET /api/admin/users)
- /admin/destinations:
  - Tạo mới (react-hook-form + zod validation)
  - Danh sách có pagination server-side (GET /api/destination?page=&pageSize=)
  - Inline edit name/slug, toggle featured (PUT)
  - Delete có confirm + toast (DELETE)
- /admin/bookings, /admin/reviews, /admin/payments, /admin/settings (stub UI)

UI/UX:
- Skeleton loading, Toast thông báo, Empty states
- Table component + Pagination (client) cho public; server-side pagination cho admin/destinations

---

## 4) Cách chạy

Yêu cầu:
- Node.js 18+
- MySQL

Cấu hình môi trường:
- File `.env` (đã có ví dụ và đã tạo sẵn):
  - DATABASE_URL="mysql://root:123456@localhost:3306/travelgo"
  - JWT_SECRET=... (đang dùng giá trị từ NEXTAUTH_SECRET bạn cung cấp)
  - PORT=3000
- Có thể xem .env.example

Backend:
- npm install
- npm run prisma:generate
- npm run prisma:migrate
- npm run prisma:seed
- npm start
- Healthcheck: http://localhost:3000 → “TravelGo API is running”

Frontend (không dùng Vite):
- cd frontend
- npm install
- npm start
- Mặc định chạy tại http://localhost:3001 (đã set PORT=3001 trong frontend/.env)
- Proxy FE→BE: frontend/package.json "proxy": "http://localhost:3000"

Đăng nhập nhanh:
- Email: admin@travelgo.dev
- Password: admin123

---

## 5) Lộ trình phát triển đề xuất

- Public Destinations: filter/search/sort + pagination server-side + category filter
- Account: thêm form chỉnh sửa Profile, đổi mật khẩu, cài đặt; upload avatar (nếu cần)
- Admin: CRUD đầy đủ cho Users/Bookings/Reviews/Payments; bulk actions; export CSV
- Payments: tích hợp provider thật (Stripe/MoMo/ZaloPay) + webhook
- Validation rộng khắp bằng zod + react-hook-form; thông báo lỗi chi tiết hơn
- E2E tests cho flows chính (Auth, Booking, Payment)

---

## 6) Ghi chú

- FE lưu JWT ở localStorage key: `tg_token`, axios interceptor tự gắn Authorization header.
- Admin guard cả phía BE (middleware) lẫn FE (route guard).
- Tất cả endpoint trả JSON; response shape một số nơi là mock/stub và sẽ được chuẩn hoá dần.
