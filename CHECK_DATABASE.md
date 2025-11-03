# Hướng dẫn Kiểm tra Database

## ✅ Xác nhận: Dữ liệu được lưu vào Database

### 1. **Đăng ký tài khoản** → Lưu vào bảng `User`

**API**: `POST /api/auth/register`

**Kiểm tra trong MySQL:**
```sql
SELECT id, email, name, role, createdAt, avatarUrl FROM User 
ORDER BY createdAt DESC 
LIMIT 10;
```

**Console log**: `✅ User registered successfully: { id, email, name }`

---

### 2. **Đăng nhập** → Không tạo record mới (chỉ verify)

**API**: `POST /api/auth/login`

**Kiểm tra**: User đã tồn tại từ lúc đăng ký

**Console log**: `✅ User logged in successfully: { id, email, name }`

---

### 3. **Tạo Booking** → Lưu vào bảng `Booking` và `Payment`

**API**: `POST /api/booking`

**Kiểm tra trong MySQL:**
```sql
-- Xem bookings
SELECT id, code, userId, destinationId, status, totalAmount, createdAt 
FROM Booking 
ORDER BY createdAt DESC 
LIMIT 10;

-- Xem payments liên quan
SELECT id, bookingId, amount, status, provider, createdAt 
FROM Payment 
ORDER BY createdAt DESC 
LIMIT 10;
```

**Console log**: `✅ Booking created successfully: { id, code, userId, destinationId, totalAmount }`

---

### 4. **Viết Review** → Lưu vào bảng `Review`

**API**: `POST /api/review`

**Lưu ý**: 
- Nếu chưa đăng nhập, hệ thống tự động tạo **guest user** trong bảng `User`
- Guest user có email pattern: `guest-{timestamp}-{random}@temp.travelgo`

**Kiểm tra trong MySQL:**
```sql
-- Xem reviews
SELECT id, userId, destinationId, rating, comment, createdAt 
FROM Review 
ORDER BY createdAt DESC 
LIMIT 10;

-- Xem guest users được tạo
SELECT id, email, name, role, createdAt 
FROM User 
WHERE email LIKE 'guest-%@temp.travelgo'
ORDER BY createdAt DESC;
```

**Console log**: `✅ Review created successfully: { id, destinationId, userId, rating }`

---

### 5. **Upload Avatar** → Lưu file + Cập nhật `User.avatarUrl`

**API**: `POST /api/upload/avatar` hoặc `POST /api/account/avatar`

**Lưu ý**:
- File được lưu vào: `uploads/avatars/avatar-{timestamp}-{random}.{ext}`
- Database: Cập nhật `User.avatarUrl` = `/uploads/avatars/{filename}`

**Kiểm tra trong MySQL:**
```sql
SELECT id, email, name, avatarUrl, updatedAt 
FROM User 
WHERE avatarUrl IS NOT NULL
ORDER BY updatedAt DESC;
```

**Kiểm tra file:**
```bash
# Xem files trong thư mục uploads/avatars
dir uploads\avatars
```

**Console log**: `✅ Avatar uploaded and saved to database: { userId, fileUrl, filename }`

---

### 6. **Thêm vào Wishlist** → Lưu vào bảng `Wishlist`

**API**: `POST /api/wishlist`

**Kiểm tra trong MySQL:**
```sql
SELECT id, userId, destinationId, createdAt 
FROM Wishlist 
ORDER BY createdAt DESC 
LIMIT 10;
```

**Console log**: `✅ Added to wishlist: { id, userId, destinationId }`

---

### 7. **Tạo Support Ticket** → Lưu vào bảng `SupportTicket`

**API**: `POST /api/support`

**Kiểm tra trong MySQL:**
```sql
SELECT id, userEmail, subject, message, status, createdAt 
FROM SupportTicket 
ORDER BY createdAt DESC 
LIMIT 10;
```

**Console log**: `✅ Support ticket created successfully: { id, userEmail, subject }`

---

### 8. **Admin: Tạo Destination** → Lưu vào bảng `Destination`

**API**: `POST /api/admin/destinations`

**Kiểm tra trong MySQL:**
```sql
SELECT id, name, slug, description, featured, price, categoryId, createdAt 
FROM Destination 
ORDER BY createdAt DESC;
```

**Console log**: `✅ Destination created successfully: { id, name, slug, price }`

---

### 9. **Tạo Payment** → Lưu vào bảng `Payment`

**API**: `POST /api/payment/create`

**Kiểm tra trong MySQL:**
```sql
SELECT id, bookingId, amount, status, provider, createdAt 
FROM Payment 
ORDER BY createdAt DESC 
LIMIT 10;
```

**Console log**: `✅ Payment created successfully: { id, bookingId, amount, provider }`

---

## 📊 Tổng quan Database

### Xem tất cả bảng và số lượng records:

```sql
-- User
SELECT COUNT(*) as total_users FROM User;

-- Booking
SELECT COUNT(*) as total_bookings FROM Booking;
SELECT COUNT(*) as pending_bookings FROM Booking WHERE status = 'PENDING';
SELECT COUNT(*) as confirmed_bookings FROM Booking WHERE status = 'CONFIRMED';

-- Review
SELECT COUNT(*) as total_reviews FROM Review;
SELECT AVG(rating) as avg_rating FROM Review;

-- Payment
SELECT COUNT(*) as total_payments FROM Payment;
SELECT COUNT(*) as pending_payments FROM Payment WHERE status = 'PENDING';

-- Wishlist
SELECT COUNT(*) as total_wishlist_items FROM Wishlist;

-- SupportTicket
SELECT COUNT(*) as total_tickets FROM SupportTicket;
SELECT COUNT(*) as open_tickets FROM SupportTicket WHERE status = 'open';

-- Destination
SELECT COUNT(*) as total_destinations FROM Destination;
SELECT COUNT(*) as featured_destinations FROM Destination WHERE featured = true;
```

---

## 🔍 Kiểm tra Real-time

### Xem logs trong console khi thao tác:

**Khi đăng ký:**
```
✅ User registered successfully: { id: 1, email: 'user@example.com', name: 'John Doe' }
```

**Khi tạo booking:**
```
✅ Booking created successfully: { id: 1, code: 'BK-1234567890', userId: 1, destinationId: 5, totalAmount: 1000000 }
```

**Khi upload avatar:**
```
✅ Avatar uploaded and saved to database: { userId: 1, fileUrl: '/uploads/avatars/avatar-1234567890-987654321.jpg', filename: 'avatar-1234567890-987654321.jpg' }
```

---

## ⚠️ Lưu ý quan trọng

1. **Database Connection**: Đảm bảo MySQL đang chạy trên port 3306 với password `123456`
2. **Prisma Migration**: Sau khi thay đổi schema, chạy `npm run prisma:migrate`
3. **AvatarUrl Field**: Đã thêm vào schema, cần migrate nếu chưa có
4. **Guest Users**: Reviews không đăng nhập sẽ tạo guest user tự động
5. **File Upload**: Files được lưu trong `uploads/` và URL được lưu trong database

---

## 🛠️ Troubleshooting

### Nếu không thấy dữ liệu trong database:

1. **Kiểm tra database connection:**
   ```sql
   -- Test connection
   SELECT 1;
   ```

2. **Kiểm tra Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

3. **Kiểm tra console logs** - Xem có log `✅` không

4. **Kiểm tra API response** - Xem có trả về success không

5. **Kiểm tra .env file:**
   ```
   DATABASE_URL=mysql://root:123456@localhost:3306/travelgo
   ```

---

## ✅ Checklist Hoàn thành

- [x] Database connection với password 123456, port 3306
- [x] Đăng ký user → Lưu vào User table
- [x] Tạo booking → Lưu vào Booking + Payment table
- [x] Viết review → Lưu vào Review table (+ tạo guest user nếu cần)
- [x] Upload avatar → Lưu file + cập nhật User.avatarUrl
- [x] Thêm wishlist → Lưu vào Wishlist table
- [x] Tạo support ticket → Lưu vào SupportTicket table
- [x] Admin tạo destination → Lưu vào Destination table
- [x] Tạo payment → Lưu vào Payment table
- [x] Thư mục uploads đã được tạo (avatars, destinations)
- [x] Logging để track database operations
- [x] Error handling và validation

