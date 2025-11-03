# 🚀 Hướng dẫn Khởi động Dự án TravelGo

## ⚠️ QUAN TRỌNG: Luôn chạy Backend TRƯỚC Frontend!

## Cách 1: Chạy riêng biệt (Khuyên dùng)

### Bước 1: Khởi động Backend
```bash
# Từ thư mục gốc (D:\HTML-CSS-JS\Project-ALL\Travelgo)
npm start
```

**Đợi đến khi thấy:**
```
✅ Database connected successfully
🚀 ====================================
✅ TravelGo API server is running on port 3000
🌐 URL: http://localhost:3000
🚀 ====================================
```

### Bước 2: Mở terminal mới - Khởi động Frontend
```bash
# Terminal mới, vẫn từ thư mục gốc
npm run frontend
```

Hoặc:
```bash
cd frontend
npm start
```

---

## Cách 2: Chạy cả 2 cùng lúc

```bash
npm run dev:all
```

**Lưu ý:** Cách này sẽ chạy cả backend và frontend, nhưng nếu một trong hai lỗi thì cả hai sẽ dừng.

---

## 🔍 Kiểm tra Backend đang chạy:

### Windows:
```bash
netstat -ano | findstr :3000
```

Nếu thấy output có `LISTENING` → Backend đang chạy ✅

### Test Backend:
```bash
curl http://localhost:3000
```

Hoặc mở browser: `http://localhost:3000`

Nếu thấy "TravelGo API is running" → Backend OK ✅

---

## 🔍 Kiểm tra Frontend:

Frontend sẽ chạy trên:
- **Port 3001** (mặc định)
- Hoặc port khác nếu 3001 bị chiếm (sẽ hiển thị trong terminal)

---

## ⚠️ Lỗi thường gặp:

### 1. Proxy Error - Backend không chạy
**Lỗi:** `ECONNREFUSED` hoặc `Proxy error`

**Giải pháp:**
1. Dừng frontend (Ctrl+C)
2. Chạy backend: `npm start`
3. Đợi backend khởi động xong
4. Chạy lại frontend

### 2. Port 3000 đã được sử dụng
**Lỗi:** `Port 3000 is already in use`

**Giải pháp:**
```bash
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process (thay PID bằng số từ lệnh trên)
taskkill /PID <PID> /F
```

### 3. Database connection failed
**Lỗi:** `Authentication failed against database server`

**Giải pháp:**
1. Kiểm tra MySQL đang chạy
2. Kiểm tra `.env` file có đúng password `123456` không
3. Chạy: `node check-database.js`

---

## 📋 Checklist trước khi chạy:

- [ ] MySQL đang chạy (port 3306)
- [ ] File `.env` có `DATABASE_URL=mysql://root:123456@localhost:3306/travelgo`
- [ ] Database `travelgo` đã được tạo
- [ ] Đã chạy `npm run prisma:generate`
- [ ] Backend chạy thành công trên port 3000
- [ ] Frontend chạy (port 3001 hoặc khác)

---

## 🎯 Thứ tự khuyến nghị:

1. ✅ **Bước 1:** Kiểm tra database
   ```bash
   node check-database.js
   ```

2. ✅ **Bước 2:** Khởi động Backend
   ```bash
   npm start
   ```
   Đợi đến khi thấy "✅ TravelGo API server is running"

3. ✅ **Bước 3:** Khởi động Frontend (terminal mới)
   ```bash
   npm run frontend
   ```

4. ✅ **Bước 4:** Mở browser: `http://localhost:3001` (hoặc port frontend hiển thị)

---

## 🔧 Script tiện ích:

### Chạy backend tự động:
```bash
start-backend.bat
```

Script này sẽ:
- Kiểm tra database trước
- Khởi động backend
- Hiển thị thông báo rõ ràng

---

**Lưu ý:** Luôn đảm bảo Backend chạy TRƯỚC Frontend để tránh lỗi Proxy!

