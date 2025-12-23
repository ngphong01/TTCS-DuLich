# 🚀 Hướng dẫn Setup TravelGo từ đầu

Hướng dẫn chi tiết để clone và setup project TravelGo với đầy đủ dữ liệu và hình ảnh.

## 📋 Yêu cầu hệ thống

- **Node.js**: v18+ 
- **MySQL**: v8.0+
- **npm** hoặc **yarn**
- **Git**

## 🔧 Bước 1: Clone Repository

```bash
git clone <repository-url>
cd Travelgo
```

## 📦 Bước 2: Cài đặt Dependencies

```bash
# Cài đặt dependencies cho cả backend và frontend
npm run install:all

# Hoặc cài đặt riêng:
npm install                    # Backend
cd frontend && npm install     # Frontend
cd ..
```

## 🗄️ Bước 3: Setup Database

### Option 1: Import SQL File (Khuyến nghị - có đầy đủ dữ liệu)

```bash
# 1. Tạo database MySQL
mysql -u root -p
CREATE DATABASE travelgo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 2. Import file SQL
mysql -u root -p travelgo < database/travelgo_complete.sql

# Hoặc nếu có file extended data:
mysql -u root -p travelgo < database/travelgo_extended_data.sql
```

### Option 2: Sử dụng Prisma Migrate + Seed

```bash
# 1. Tạo file .env từ ENV_SAMPLE.txt
cp ENV_SAMPLE.txt .env

# 2. Cập nhật DATABASE_URL trong .env
# DATABASE_URL=mysql://root:123456@localhost:3306/travelgo

# 3. Chạy Prisma migrate
npm run prisma:migrate

# 4. Chạy seed để tạo dữ liệu mẫu
npm run prisma:seed
```

## 🔐 Bước 4: Cấu hình Environment Variables

```bash
# Copy file mẫu
cp ENV_SAMPLE.txt .env

# Chỉnh sửa .env với thông tin của bạn:
# - DATABASE_URL: Kết nối MySQL
# - JWT_SECRET: Secret key cho JWT (tạo random string)
# - GEMINI_API_KEY: API key cho Gemini AI (nếu dùng)
# - Các thông tin email, payment khác...
```

## 🖼️ Bước 5: Kiểm tra Hình ảnh và Logo

Các file sau đã được commit vào repository:

- ✅ `uploads/Logo/logo.png` - Logo chính
- ✅ `frontend/public/logo.png` - Logo frontend
- ✅ `uploads/avatars/*.jpg` - Ảnh destinations mẫu (46+ ảnh)
- ✅ `frontend/public/logos/*.svg` - Logo payment methods

Kiểm tra:
```bash
# Kiểm tra logo
ls uploads/Logo/
ls frontend/public/logo.png

# Kiểm tra ảnh destinations
ls uploads/avatars/*.jpg | wc -l  # Số lượng ảnh
```

## 🚀 Bước 6: Chạy Application

### Development Mode

```bash
# Chạy cả backend và frontend cùng lúc
npm run dev:all

# Hoặc chạy riêng:
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend  
npm run frontend
```

### Production Mode

```bash
# Build frontend
cd frontend
npm run build
cd ..

# Chạy backend (sẽ serve frontend build)
npm start
```

## ✅ Bước 7: Kiểm tra Setup

1. **Backend**: http://localhost:3000
   - API Health: http://localhost:3000/api/health
   - API Docs: http://localhost:3000/api

2. **Frontend**: http://localhost:3001
   - Trang chủ với destinations
   - Logo hiển thị đúng
   - Ảnh destinations load được

3. **Database**:
   ```sql
   USE travelgo;
   SELECT COUNT(*) FROM Destination;  -- Nên có ~46 destinations
   SELECT COUNT(*) FROM Tour;          -- Nên có tours
   SELECT COUNT(*) FROM Hotel;         -- Nên có hotels
   SELECT COUNT(*) FROM Restaurant;    -- Nên có restaurants
   ```

## 🔑 Tài khoản Admin mặc định

Sau khi import database hoặc chạy seed:

```
Email: phong@triennguyen.com  
Password: Phong@2004
Role: ADMIN

Email: admin@travelgo.dev
Password: admin123
Role: ADMIN
```

**Lưu ý**: Tài khoản chính là `phong@triennguyen.com` với password `Phong@2004`

## 📝 Scripts hữu ích

```bash
# Reset database và seed lại
npm run prisma:migrate reset
npm run prisma:seed

# Generate Prisma client sau khi thay đổi schema
npm run prisma:generate

# Chạy seed riêng
npm run prisma:seed
```

## 🔍 Kiểm tra Setup

Trước khi chạy ứng dụng, kiểm tra setup:

```bash
npm run check
```

Script này sẽ kiểm tra:
- ✅ File .env tồn tại
- ✅ node_modules đã cài đặt
- ✅ Logo và ảnh tồn tại
- ✅ Database SQL file tồn tại
- ✅ Prisma client đã generate
- ✅ Seed file tồn tại

## 🐛 Troubleshooting

### Lỗi khi clone về

**1. Lỗi "Cannot find module"**
```bash
# Cài đặt lại dependencies
npm run install:all

# Generate Prisma client
npm run prisma:generate
```

**2. Lỗi database connection**
```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p -e "SELECT 1"

# Kiểm tra DATABASE_URL trong .env
# DATABASE_URL=mysql://root:password@localhost:3306/travelgo

# Import database
mysql -u root -p travelgo < database/travelgo_complete.sql
```

**3. Logo không hiển thị**
- Kiểm tra file `uploads/Logo/logo.png` có tồn tại
- Kiểm tra `frontend/public/logo.png` có tồn tại
- Clear browser cache
- Kiểm tra quyền đọc file: `chmod 644 uploads/Logo/logo.png`

**4. Ảnh destinations không hiển thị**
- Kiểm tra folder `uploads/avatars/` có đầy đủ ảnh
- Kiểm tra quyền đọc file
- Kiểm tra đường dẫn trong database (phải là `/uploads/avatars/...`)
- Chạy seed lại: `npm run prisma:seed`

**5. Lỗi Prisma**
```bash
# Reset Prisma
npx prisma generate
npx prisma migrate reset
npm run prisma:seed
```

**6. Lỗi khi chạy npm run dev:all**
```bash
# Kiểm tra port 3000 và 3001 có đang được sử dụng
# Windows:
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Linux/Mac:
lsof -i :3000
lsof -i :3001

# Nếu port bị chiếm, kill process hoặc đổi port trong .env
```

**7. Lỗi "Module not found" trong frontend**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..
```

**8. Database rỗng sau khi clone**
```bash
# Import SQL file
mysql -u root -p travelgo < database/travelgo_complete.sql

# Hoặc chạy seed
npm run prisma:seed
```

## 📚 Tài liệu thêm

- [README.md](./README.md) - Tài liệu chính
- [ENV_SAMPLE.txt](./ENV_SAMPLE.txt) - Mẫu environment variables
- [database/travelgo_complete.sql](./database/travelgo_complete.sql) - SQL file đầy đủ

## 🎉 Hoàn thành!

Bây giờ bạn đã có một bản TravelGo hoàn chỉnh với:
- ✅ 46+ destinations với ảnh
- ✅ Tours, Hotels, Restaurants
- ✅ Logo và branding
- ✅ Admin accounts
- ✅ Database đầy đủ dữ liệu

Chúc bạn code vui vẻ! 🚀

