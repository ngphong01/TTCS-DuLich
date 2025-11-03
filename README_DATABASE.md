# 📚 Hướng dẫn Database và Upload - TravelGo

## ✅ Hoàn thành: Database Connection & Upload System

## Cấu hình Database

### Thông tin kết nối:
- **Host**: localhost
- **Port**: 3306
- **Password**: 123456
- **Database**: travelgo

### File .env:
Tạo file `.env` trong thư mục gốc với nội dung:

```
DATABASE_URL=mysql://root:123456@localhost:3306/travelgo
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Khởi tạo Database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Tạo database và tables
npm run prisma:migrate

# Seed data mẫu
npm run prisma:seed
```

## Dữ liệu được lưu vào Database

### ✅ Khi đăng ký tài khoản:
- POST `/api/auth/register` → Lưu vào bảng **User**
- Bạn có thể kiểm tra trong MySQL:
  ```sql
  SELECT * FROM User;
  ```

### ✅ Khi đăng nhập:
- POST `/api/auth/login` → Không tạo record mới (chỉ verify)
- User đã tồn tại từ lúc đăng ký

### ✅ Khi tạo booking:
- POST `/api/booking` → Lưu vào bảng **Booking** và **Payment**
- Kiểm tra:
  ```sql
  SELECT * FROM Booking;
  SELECT * FROM Payment;
  ```

### ✅ Khi viết review:
- POST `/api/review` → Lưu vào bảng **Review**
- Nếu chưa đăng nhập, tự động tạo guest user trong bảng **User**
- Kiểm tra:
  ```sql
  SELECT * FROM Review;
  ```

### ✅ Khi upload avatar:
- POST `/api/upload/avatar` hoặc `/api/account/avatar`
- Lưu file vào thư mục `uploads/avatars/`
- Cập nhật `avatarUrl` trong bảng **User**
- Kiểm tra:
  ```sql
  SELECT id, name, email, avatarUrl FROM User;
  ```

### ✅ Khi thêm vào wishlist:
- POST `/api/wishlist` → Lưu vào bảng **Wishlist**
- Kiểm tra:
  ```sql
  SELECT * FROM Wishlist;
  ```

### ✅ Khi tạo support ticket:
- POST `/api/support` → Lưu vào bảng **SupportTicket**
- Kiểm tra:
  ```sql
  SELECT * FROM SupportTicket;
  ```

### ✅ Khi admin tạo destination:
- POST `/api/admin/destinations` → Lưu vào bảng **Destination**
- Kiểm tra:
  ```sql
  SELECT * FROM Destination;
  ```

## Thư mục Upload Ảnh

### Cấu trúc thư mục:
```
uploads/
├── avatars/          # Ảnh đại diện user
└── destinations/     # Ảnh điểm đến
```

### Tạo thư mục:
Chạy file `create-uploads-folders.bat` hoặc tạo thủ công:
```bash
mkdir uploads
mkdir uploads\avatars
mkdir uploads\destinations
```

### API Upload:
- **Avatar**: POST `/api/upload/avatar` hoặc `/api/account/avatar`
  - Yêu cầu: Authentication
  - File size: tối đa 5MB
  - Format: image/*
  
- **Destination**: POST `/api/upload/destination`
  - Yêu cầu: Authentication + Admin
  - File size: tối đa 10MB
  - Format: image/*

### Truy cập ảnh:
Sau khi upload, ảnh có thể truy cập tại:
- `http://localhost:3000/uploads/avatars/filename.jpg`
- `http://localhost:3000/uploads/destinations/filename.jpg`

## Kiểm tra dữ liệu trong Database

### MySQL Command:
```sql
-- Xem tất cả users
SELECT id, email, name, role, createdAt FROM User;

-- Xem bookings
SELECT id, code, userId, destinationId, status, totalAmount, createdAt FROM Booking;

-- Xem reviews
SELECT id, userId, destinationId, rating, comment, createdAt FROM Review;

-- Xem payments
SELECT id, bookingId, amount, status, provider, createdAt FROM Payment;
```

## Lưu ý quan trọng

1. **Prisma Migration**: Sau khi thay đổi schema, chạy:
   ```bash
   npm run prisma:migrate
   ```

2. **AvatarUrl field**: Đã thêm vào schema User, cần migrate:
   ```bash
   npm run prisma:migrate
   ```

3. **Multer package**: Cần cài đặt:
   ```bash
   npm install multer
   ```

4. **Static files**: Server đã cấu hình serve static files từ `/uploads`

