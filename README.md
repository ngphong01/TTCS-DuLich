# 🌍 TravelGo - Nền Tảng Du Lịch Toàn Diện

![TravelGo Banner](./uploads/Logo/travelgo-banner.png)

**TravelGo** là nền tảng du lịch đa chức năng, toàn diện với hệ thống backend mạnh mẽ và frontend hiện đại. Website cung cấp trải nghiệm đặt tour, khách sạn, nhà hàng với AI hỗ trợ thông minh và thanh toán đa cổng.

---

## 📑 Mục lục

- [Quick Start](#-quick-start) ⚡
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt và chạy](#-cài-đặt-và-chạy)
- [Database](#️-database)
- [API Documentation](#-api-documentation)
- [Frontend Pages](#-frontend-pages)
- [Thanh toán](#-thanh-toán)
- [AI Features](#-ai-features)
- [Deployment](#-deployment)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)

---

## ⚡ Quick Start

### Clone và Setup nhanh:

```bash
# 1. Clone repository
git clone <repository-url>
cd Travelgo

# 2. Cài đặt dependencies
npm run install:all

# 3. Setup database (chọn 1 trong 2 cách)

# Cách 1: Import SQL file (khuyến nghị - có đầy đủ dữ liệu)
mysql -u root -p < database/travelgo_complete.sql

# Cách 2: Sử dụng script tự động
npm run setup:db

# 4. Cấu hình .env
cp ENV_SAMPLE.txt .env
# Chỉnh sửa DATABASE_URL và các thông tin khác trong .env

# 5. Kiểm tra setup (khuyến nghị)
npm run check

# 6. Chạy ứng dụng
npm run dev:all
```

**Xem chi tiết**: [SETUP.md](./SETUP.md) - Hướng dẫn setup đầy đủ với troubleshooting

---

## ✨ Tính năng chính

### 🎯 Người dùng (User Features)

#### **1. Tìm kiếm & Khám phá**

- ✅ **46+ Điểm đến** trên toàn thế giới (Việt Nam, Châu Á, Châu Âu, Châu Mỹ, Châu Úc)
- ✅ **43+ Tours** đa dạng: Du thuyền, Trekking, City Tour, Beach, Culture, Adventure
- ✅ **35+ Hotels** với đầy đủ tiện nghi, ảnh và giá chi tiết
- ✅ **35+ Restaurants** từ street food đến fine dining, Michelin stars
- ✅ Lọc theo: Khu vực, Giá, Đánh giá, Loại hình
- ✅ Tìm kiếm thông minh với AI
- ✅ Danh sách yêu thích (Wishlist)

#### **2. Đặt chỗ & Thanh toán**

- ✅ Đặt tour trực tuyến với nhiều gói combo
- ✅ Đặt khách sạn theo đêm
- ✅ Đặt bàn nhà hàng
- ✅ **Thanh toán đa cổng**:
  - 💳 Stripe (Quốc tế)
  - 💳 PayPal
  - 💳 MoMo
  - 💳 VNPay
  - 💳 ZaloPay
- ✅ Lịch sử đặt chỗ & thanh toán chi tiết
- ✅ Hóa đơn PDF tự động gửi email

#### **3. Tài khoản cá nhân**

- ✅ Đăng ký/Đăng nhập với JWT
- ✅ Google OAuth 2.0
- ✅ Xác thực 2 bước (2FA) với QR code
- ✅ Avatar tùy chỉnh + Upload ảnh
- ✅ Quản lý thông tin cá nhân
- ✅ Đổi mật khẩu, Security settings
- ✅ Điểm tích lũy (Loyalty points)
- ✅ Thông báo (Notifications)
- ✅ Đánh giá & Review

#### **4. Tương tác & Nội dung**

- ✅ Blog du lịch với ảnh đẹp
- ✅ Stories/Câu chuyện du lịch
- ✅ Đánh giá & Rating (1-5 sao)
- ✅ Bình luận (helpful votes)
- ✅ Live Chat 24/7
- ✅ Email Newsletter subscription

---

### 🔧 Quản trị viên (Admin Features)

#### **1. Dashboard Tổng quan**

- ✅ Thống kê doanh thu, booking, users, destinations
- ✅ Biểu đồ doanh thu theo tháng
- ✅ Top destinations, tours phổ biến
- ✅ Recent bookings & payments

#### **2. Quản lý nội dung**

- ✅ **Destinations**: CRUD đầy đủ, upload ảnh, featured toggle
- ✅ **Tours**: Tạo tour với itinerary, highlights, pricing
- ✅ **Hotels**: Quản lý khách sạn, amenities, pricing
- ✅ **Restaurants**: Thêm nhà hàng, cuisine types, price range
- ✅ **Categories**: Quản lý danh mục (Beach, Adventure, City...)
- ✅ **Blogs**: CRUD blog posts với rich text editor
- ✅ **Banners**: Quản lý banner trang chủ

#### **3. Quản lý đặt chỗ**

- ✅ Danh sách tất cả bookings
- ✅ Workflow: Pending → Confirmed → Completed → Cancelled
- ✅ Lọc theo status, date range, user
- ✅ Xem chi tiết booking
- ✅ Export CSV/Excel

#### **4. Quản lý người dùng**

- ✅ Danh sách users với role (USER/ADMIN)
- ✅ Phân quyền (Role management)
- ✅ Khoá/Mở khoá tài khoản
- ✅ Activity log tracking

#### **5. Thanh toán & Báo cáo**

- ✅ Danh sách payments
- ✅ Cổng thanh toán (Payment gateway settings)
- ✅ Refund management
- ✅ Revenue reports
- ✅ Export financial data

#### **6. Email & Marketing**

- ✅ Email templates
- ✅ Email campaigns
- ✅ Newsletter management
- ✅ Promotional emails
- ✅ Automated emails (booking confirmation, payment receipt)

#### **7. Reviews & Support**

- ✅ Quản lý đánh giá (Approve/Reject)
- ✅ Support tickets
- ✅ Live chat monitoring
- ✅ FAQ management

---

### 🤖 AI Features (Tích hợp AI)

- ✅ **Gemini AI Chatbot**: Tư vấn du lịch thông minh 24/7
- ✅ **AI Search**: Tìm kiếm ngữ nghĩa (semantic search)
- ✅ **AI Tour Description Generator**: Tự động tạo mô tả tour
- ✅ **AI Price Optimizer**: Đề xuất giá tốt nhất
- ✅ **AI Itinerary Planner**: Lên lịch trình du lịch tự động
- ✅ **AI System Manager**: Giám sát và tối ưu hệ thống
- ✅ **AI Advanced Automation**: Phân tích dữ liệu, dự đoán xu hướng

---

## 🛠️ Công nghệ sử dụng

### Backend

```
Node.js 18+
Express.js 5
Prisma ORM
MySQL 8
JWT Authentication
Bcrypt (Password hashing)
Nodemailer (Email)
Redis (Caching)
WebSocket (Live chat)
```

### Frontend

```
React 18 + TypeScript
React Router v6
Tailwind CSS 3
React Query (Data fetching)
Axios (HTTP client)
React Hook Form + Zod (Form validation)
React Hot Toast (Notifications)
Heroicons (Icons)
```

### AI & Services

```
Google Gemini AI
Google OAuth 2.0
Stripe API
PayPal SDK
MoMo API
VNPay API
ZaloPay API
Cloudinary (Image hosting)
AWS S3 (File storage)
```

---

## 📁 Cấu trúc dự án

```
Travelgo/
├── 📂 backend (Root)
│   ├── index.js              # Entry point
│   ├── .env                  # Environment variables
│   ├── 📂 routes/            # API routes (43 files)
│   │   ├── auth.js           # Authentication
│   │   ├── destination.js    # Destinations
│   │   ├── tour.js           # Tours
│   │   ├── hotel.js          # Hotels
│   │   ├── restaurant.js     # Restaurants
│   │   ├── booking.js        # Bookings
│   │   ├── payment.js        # Payments
│   │   ├── ai.js             # AI features
│   │   └── ...               # 35+ more routes
│   ├── 📂 middleware/        # Auth, Rate limit, Cache
│   ├── 📂 services/          # Payment gateways, AI
│   ├── 📂 lib/               # Utilities, Prisma client
│   └── 📂 prisma/
│       ├── schema.prisma     # Database schema
│       └── seed.js           # Seed data
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── App.tsx           # Main app
│   │   ├── main.css          # Global styles
│   │   ├── 📂 pages/         # 50+ pages
│   │   │   ├── Home.tsx
│   │   │   ├── Destinations.tsx
│   │   │   ├── DestinationDetail.tsx
│   │   │   ├── Tours.tsx
│   │   │   ├── TourDetail.tsx
│   │   │   ├── Hotels.tsx
│   │   │   ├── HotelDetail.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Featured.tsx
│   │   │   ├── Stories.tsx
│   │   │   ├── BlogList.tsx
│   │   │   ├── BlogDetail.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── 📂 auth/     # Auth pages
│   │   │   ├── 📂 account/  # User dashboard (12 pages)
│   │   │   ├── 📂 admin/    # Admin dashboard (15+ pages)
│   │   │   └── 📂 checkout/ # Payment pages
│   │   ├── 📂 components/   # 35+ reusable components
│   │   ├── 📂 layouts/      # Layout wrappers
│   │   ├── 📂 hooks/        # Custom hooks
│   │   ├── 📂 services/     # API services
│   │   └── 📂 lib/          # Utils, API client
│   ├── public/              # Static assets
│   ├── package.json
│   └── tailwind.config.js
│
├── 📂 database/
│   ├── travelgo_complete.sql      # Full database (4379 lines)
│   ├── travelgo_schema.sql        # Schema only
│   ├── travelgo_data.sql          # Sample data (46 destinations)
│   └── travelgo_extended_data.sql # Extended data (43 tours, 35 hotels, 35 restaurants) ⭐ MỚI
│
├── 📂 uploads/              # User uploads
│   ├── avatars/
│   ├── destinations/
│   ├── tours/
│   ├── hotels/
│   ├── restaurants/
│   └── blogs/
│
└── 📄 Documentation/
    ├── README.md                    # This file
    ├── API_DOCUMENTATION.md
    ├── GOOGLE_OAUTH_SETUP.md
    ├── PAYPAL_SETUP_GUIDE.md
    ├── AI_FEATURES_COMPLETE.md
    └── START_HERE.md
```

---

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

```bash
Node.js 18+
MySQL 8+
Redis (optional, cho cache)
Git
```

### 1. Clone repository

```bash
git clone https://github.com/yourusername/travelgo.git
cd travelgo
```

### 2. Cài đặt Backend

```bash
# Install dependencies
npm install

# Setup environment
cp ENV_SAMPLE.txt .env
# Chỉnh sửa .env với thông tin của bạn

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Import database
mysql -u root -p travelgo < database/travelgo_complete.sql
# Hoặc import extended data
mysql -u root -p travelgo < database/travelgo_extended_data.sql

# Start backend
npm start
# Backend chạy tại http://localhost:3000
```

### 3. Cài đặt Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
# Frontend chạy tại http://localhost:3001
```

### 4. (Optional) Redis Cache

```bash
# Install Redis
brew install redis  # macOS
sudo apt install redis  # Ubuntu

# Start Redis
redis-server

# Enable in .env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

---

## 🗄️ Database

### Schema chính

```prisma
// Prisma Schema (simplified)

model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  passwordHash  String
  name          String?
  phone         String?
  avatar        String?
  role          Role      @default(USER)  // USER | ADMIN
  twoFactorSecret String?
  bookings      Booking[]
  reviews       Review[]
  wishlist      Wishlist[]
  loyalty       Loyalty?
}

model Destination {
  id          Int       @id @default(autoincrement())
  name        String
  slug        String    @unique
  description String    @db.Text
  image       String?
  country     String
  price       Int
  featured    Boolean   @default(false)
  rating      Float?    @default(0)
  categoryId  Int?
  tours       Tour[]
  hotels      Hotel[]
  restaurants Restaurant[]
  reviews     Review[]
}

model Tour {
  id               Int       @id @default(autoincrement())
  name             String
  slug             String    @unique
  description      String    @db.Text
  shortDescription String?
  image            String?
  duration         Int       // Số ngày
  price            Int
  originalPrice    Int?
  rating           Float?    @default(0)
  reviewCount      Int       @default(0)
  tags             Json?
  featured         Boolean   @default(false)
  highlights       Json?     // [{icon, text}]
  itinerary        Json?     // [{day, title, activities}]
  destinationId    Int
  destination      Destination @relation(fields: [destinationId], references: [id])
  bookings         BookingTour[]
  reviews          TourReview[]
}

model Hotel {
  id            Int       @id @default(autoincrement())
  name          String
  slug          String    @unique
  description   String    @db.Text
  image         String?
  address       String
  city          String
  country       String
  pricePerNight Int
  rating        Float?    @default(0)
  featured      Boolean   @default(false)
  amenities     Json?     // ["wifi", "pool", "spa"]
  destinationId Int?
  destination   Destination? @relation(fields: [destinationId], references: [id])
}

model Restaurant {
  id            Int       @id @default(autoincrement())
  name          String
  slug          String    @unique
  description   String    @db.Text
  image         String?
  address       String
  city          String
  country       String
  cuisine       String    // Việt Nam, Hải sản, Italian...
  priceRange    String    // $, $$, $$$
  rating        Float?    @default(0)
  featured      Boolean   @default(false)
  amenities     Json?
  destinationId Int?
  destination   Destination? @relation(fields: [destinationId], references: [id])
}

model Booking {
  id            Int          @id @default(autoincrement())
  userId        Int
  destinationId Int
  numberOfPeople Int
  totalPrice    Int
  status        BookingStatus @default(PENDING)
  // PENDING | CONFIRMED | COMPLETED | CANCELLED
  createdAt     DateTime     @default(now())
  user          User         @relation(fields: [userId], references: [id])
  destination   Destination  @relation(fields: [destinationId], references: [id])
  payment       Payment?
}

model Payment {
  id            Int          @id @default(autoincrement())
  bookingId     Int          @unique
  amount        Int
  method        String       // stripe, paypal, momo, vnpay, zalopay
  status        PaymentStatus @default(PENDING)
  // PENDING | COMPLETED | FAILED | REFUNDED
  transactionId String?
  createdAt     DateTime     @default(now())
  booking       Booking      @relation(fields: [bookingId], references: [id])
}

// ... 20+ models khác
```

### Import Database

**Option 1: Full database (Recommended)**

```bash
mysql -u root -p travelgo < database/travelgo_complete.sql
```

**Option 2: Extended data (43 tours, 35 hotels, 35 restaurants)** ⭐

```bash
# Import schema first
mysql -u root -p travelgo < database/travelgo_schema.sql
# Then import extended data
mysql -u root -p travelgo < database/travelgo_extended_data.sql
```

### Database Statistics

```
✅ 46 Destinations (Việt Nam: 15, Châu Á: 13, Châu Âu: 10, Châu Mỹ & Úc: 5, Khác: 3)
✅ 43 Tours (Luxury cruise, Adventure, City tour, Beach, Culture, Food tour...)
✅ 35 Hotels (5 sao, 4 sao, Boutique, Resort, với đầy đủ amenities)
✅ 35 Restaurants (Street food, Fine dining, Michelin stars, Local specialties)
✅ 5 Categories (Beach, Adventure, City, Nature, Culture)
✅ 2 Admin accounts
```

---

## 📡 API Documentation

### Authentication

```http
POST /api/auth/register          # Đăng ký
POST /api/auth/login             # Đăng nhập
POST /api/auth/logout            # Đăng xuất
POST /api/auth/forgot-password   # Quên mật khẩu
POST /api/auth/reset-password    # Reset mật khẩu
GET  /api/auth/google            # Google OAuth
POST /api/auth/google/callback   # Google callback
```

### Destinations

```http
GET    /api/destination               # Danh sách (pagination, filter)
GET    /api/destination/featured      # Destinations nổi bật
GET    /api/destination/search        # Tìm kiếm
GET    /api/destination/:slug         # Chi tiết
POST   /api/destination               # Tạo mới (Admin)
PUT    /api/destination/:id           # Cập nhật (Admin)
DELETE /api/destination/:id           # Xóa (Admin)
```

### Tours

```http
GET    /api/tour                      # Danh sách tours
GET    /api/tour/:slug                # Chi tiết tour
GET    /api/tour/destination/:id     # Tours theo destination
POST   /api/tour                      # Tạo tour (Admin)
PUT    /api/tour/:id                  # Cập nhật (Admin)
DELETE /api/tour/:id                  # Xóa (Admin)
```

### Hotels

```http
GET    /api/hotel                     # Danh sách hotels
GET    /api/hotel/:slug               # Chi tiết hotel
GET    /api/hotel/destination/:id    # Hotels theo destination
POST   /api/hotel                     # Tạo hotel (Admin)
PUT    /api/hotel/:id                 # Cập nhật (Admin)
```

### Restaurants

```http
GET    /api/restaurant                # Danh sách restaurants
GET    /api/restaurant/:slug          # Chi tiết restaurant
GET    /api/restaurant/destination/:id # Restaurants theo destination
POST   /api/restaurant                # Tạo restaurant (Admin)
```

### Bookings

```http
GET    /api/booking/user/:id          # Bookings của user
POST   /api/booking                   # Tạo booking
PUT    /api/booking/:id/status        # Cập nhật status (Admin)
DELETE /api/booking/:id               # Hủy booking
```

### Payments

```http
POST   /api/payment/create            # Tạo payment
POST   /api/payment/stripe            # Thanh toán Stripe
POST   /api/payment/paypal            # Thanh toán PayPal
POST   /api/payment/momo              # Thanh toán MoMo
POST   /api/payment/vnpay             # Thanh toán VNPay
POST   /api/payment/zalopay           # Thanh toán ZaloPay
GET    /api/payment/:id               # Chi tiết payment
GET    /api/payment/user/:id          # Payments của user
```

### AI Features

```http
POST   /api/ai/chat                   # Gemini chatbot
POST   /api/ai/generate-description   # Tạo mô tả tour
POST   /api/ai/optimize-price         # Đề xuất giá
POST   /api/ai/plan-itinerary         # Lên lịch trình
GET    /api/ai/recommendations        # Gợi ý destinations
```

### Admin

```http
GET    /api/admin/summary             # Dashboard stats
GET    /api/admin/users               # Quản lý users
GET    /api/admin/bookings            # Quản lý bookings
GET    /api/admin/payments            # Quản lý payments
GET    /api/admin/reviews             # Quản lý reviews
POST   /api/admin/email-campaign      # Gửi email campaign
```

**📘 Full API Documentation**: Xem file `API_DOCUMENTATION.md`

---

## 🎨 Frontend Pages

### Public Pages (17 pages)

```
/                    - Home (Hero, Featured destinations, Stats)
/destinations        - Danh sách destinations (Filter, Search, Pagination)
/destinations/:slug  - Chi tiết destination
/tours               - Danh sách tours
/tours/:slug         - Chi tiết tour (Itinerary, Highlights, Booking)
/hotels              - Danh sách hotels
/hotels/:slug        - Chi tiết hotel
/categories          - Categories browsing
/featured            - Featured destinations & tours
/deals               - Deals & promotions
/stories             - Travel stories
/stories/:slug       - Story detail
/blog                - Blog list
/blog/:slug          - Blog detail
/about               - Về chúng tôi
/contact             - Liên hệ
/faq                 - FAQ
```

### Auth Pages (6 pages)

```
/signin              - Đăng nhập
/signup              - Đăng ký
/forgot-password     - Quên mật khẩu
/reset-password/:token - Reset mật khẩu
/auth/callback/:provider - OAuth callback
/auth/success        - Login success
```

### User Account (12 pages)

```
/account/profile       - Thông tin cá nhân
/account/bookings      - Lịch sử đặt chỗ
/account/payments      - Lịch sử thanh toán
/account/wishlist      - Danh sách yêu thích
/account/reviews       - Đánh giá của tôi
/account/notifications - Thông báo
/account/loyalty       - Điểm tích lũy
/account/settings      - Cài đặt
/account/password      - Đổi mật khẩu
/account/security      - Bảo mật (2FA)
/account/support       - Hỗ trợ
/account/invoices      - Hóa đơn
```

### Admin Dashboard (15+ pages)

```
/admin                      - Dashboard
/admin/destinations         - Quản lý destinations
/admin/destinations/create  - Tạo destination
/admin/destinations/:id     - Sửa destination
/admin/tours                - Quản lý tours
/admin/hotels               - Quản lý hotels
/admin/restaurants          - Quản lý restaurants
/admin/users                - Quản lý users
/admin/users/roles          - Phân quyền
/admin/bookings             - Quản lý bookings
/admin/bookings/workflow    - Workflow bookings
/admin/payments             - Quản lý payments
/admin/payments/gateways    - Cổng thanh toán
/admin/reviews              - Quản lý reviews
/admin/content              - Quản lý nội dung (blogs, banners)
/admin/settings             - Cài đặt hệ thống
```

### Checkout (3 pages)

```
/checkout           - Thanh toán
/checkout/success   - Thanh toán thành công
/checkout/cancel    - Hủy thanh toán
```

**Tổng cộng: 50+ pages**

---

## 💳 Thanh toán

### Payment Gateways

#### 1. **Stripe** (Quốc tế)

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### 2. **PayPal**

```env
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox
```

#### 3. **MoMo** (Việt Nam)

```env
MOMO_PARTNER_CODE=...
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
```

#### 4. **VNPay** (Việt Nam)

```env
VNPAY_TMN_CODE=...
VNPAY_HASH_SECRET=...
```

#### 5. **ZaloPay** (Việt Nam)

```env
ZALOPAY_APP_ID=...
ZALOPAY_KEY1=...
ZALOPAY_KEY2=...
```

**Setup Guide**: Xem file `PAYPAL_SETUP_GUIDE.md`

---

## 🤖 AI Features

### Google Gemini AI Integration

#### 1. **AI Chatbot**

- Tư vấn du lịch 24/7
- Trả lời câu hỏi về destinations, tours
- Gợi ý lịch trình phù hợp budget

#### 2. **AI Search**

- Tìm kiếm ngữ nghĩa (semantic search)
- Hiểu ý định người dùng
- Gợi ý thông minh

#### 3. **AI Content Generator**

- Tự động tạo mô tả tour
- Viết highlights hấp dẫn
- Tạo itinerary chi tiết

#### 4. **AI System Manager**

- Giám sát hiệu suất hệ thống
- Phát hiện lỗi tự động
- Đề xuất tối ưu hóa

**Setup**: Xem file `AI_FEATURES_COMPLETE.md`

---

## 🚀 Deployment

### Backend Deployment (Node.js)

#### Heroku

```bash
heroku create travelgo-api
heroku addons:create jawsdb:kitefin  # MySQL
heroku config:set JWT_SECRET=...
git push heroku main
```

#### DigitalOcean / AWS EC2

```bash
# Install Node.js, MySQL, Nginx
# Setup PM2
pm2 start index.js --name travelgo-api
pm2 startup
pm2 save
```

### Frontend Deployment

#### Vercel (Recommended)

```bash
cd frontend
vercel --prod
```

#### Netlify

```bash
cd frontend
npm run build
netlify deploy --prod --dir=build
```

### Database

#### MySQL Cloud Options

- **AWS RDS**
- **Azure Database for MySQL**
- **Google Cloud SQL**
- **PlanetScale** (Recommended for Prisma)

### CDN & Assets

```bash
# Upload images to Cloudinary/S3
# Configure CDN (CloudFlare/AWS CloudFront)
```

---

## 👤 Tài khoản mặc định

### Admin Account

```
Email: admin@travelgo.dev
Password: admin123
Role: ADMIN
```

### Test User

```
Email: phong@triennguyen.com
Password: admin123
Role: ADMIN
```

**⚠️ QUAN TRỌNG**: Đổi mật khẩu ngay sau khi deploy production!

---

## 🎨 Theme Colors (Đã thay đổi)

### Bảng màu mới (Ocean Theme)

```css
/* Turquoise & Teal - Phù hợp website du lịch */
--accent: #06b6d4;      /* cyan-500 - turquoise biển */
--accent-2: #14b8a6;    /* teal-500 - xanh lá biển */
--accent-3: #0ea5e9;    /* sky-500 - xanh trời */

/* Tailwind config */
primary: '#06b6d4'      // Cyan
secondary: '#14b8a6'    // Teal
accent: '#0ea5e9'       // Sky Blue
```

### Bảng màu cũ (Đã bỏ)

```css
/* Purple & Pink - Đã thay thế */
--accent: #3b82f6; /* blue-500 */
--accent-2: #8b5cf6; /* purple-500 - ĐÃ BỎ */
--accent-3: #ec4899; /* pink-500 - ĐÃ BỎ */
```

---

## 📊 Performance Optimization

### Caching Strategy

```javascript
// Redis cache for frequent queries
- Destinations list: 5 phút
- Featured tours: 10 phút
- Reviews: 3 phút
- Hotel details: 15 phút
```

### Image Optimization

```javascript
// Cloudinary transformations
- Thumbnails: 300x200
- Medium: 800x600
- Large: 1200x800
- WebP format
- Lazy loading
```

### Database Indexing

```sql
-- Indexed fields
CREATE INDEX idx_destination_slug ON Destination(slug);
CREATE INDEX idx_destination_featured ON Destination(featured);
CREATE INDEX idx_tour_destination ON Tour(destinationId);
CREATE INDEX idx_booking_user ON Booking(userId);
CREATE INDEX idx_payment_booking ON Payment(bookingId);
```

---

## 🔒 Security

### Authentication & Authorization

- ✅ JWT với expiry time
- ✅ Bcrypt password hashing (salt rounds: 10)
- ✅ 2FA với TOTP (Time-based OTP)
- ✅ Rate limiting: 100 requests/15 phút
- ✅ CORS configuration
- ✅ Helmet.js (Security headers)
- ✅ XSS protection
- ✅ CSRF tokens

### Data Protection

- ✅ Input validation (Zod schema)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ File upload validation
- ✅ Environment variables (.env)

---

## 📝 License

MIT License - Xem file `LICENSE`

---

## 👥 Contributors

- **Phong Trịnh** - Full Stack Developer
- **Team TravelGo** - QA & Testing

---

## 📞 Contact & Support

- 📧 Email: admin@travelgo.dev
- 🌐 Website: https://travelgo.vn
- 💬 Live Chat: Có sẵn trên website
- 📱 Hotline: 1900 xxxx

---

## 🗺️ Roadmap

### Q1 2024 ✅

- [x] Core features (Destinations, Tours, Bookings)
- [x] Multi-payment gateways
- [x] Admin dashboard
- [x] AI integration

### Q2 2024 🚧

- [ ] Mobile app (React Native)
- [ ] Multi-language (i18n)
- [ ] Advanced analytics
- [ ] Affiliate program

### Q3 2024 📋

- [ ] VR tour preview
- [ ] Social media integration
- [ ] Group booking
- [ ] Loyalty rewards program v2

---

## 🙏 Acknowledgments

- React Team
- Prisma Team
- Tailwind CSS Team
- Google Gemini AI
- All payment gateway providers
- Open source community

---

**Made with ❤️ by Phong**

---

## 📚 Additional Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
- [PayPal Setup Guide](./PAYPAL_SETUP_GUIDE.md)
- [AI Features Complete](./AI_FEATURES_COMPLETE.md)
- [Start Here](./START_HERE.md)
- [Database Schema](./database/travelgo_schema.sql)

---

**🌟 Star this repo if you find it helpful!**
