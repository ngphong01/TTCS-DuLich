# 🔧 Fix Proxy Error - Hướng dẫn Chi tiết

## ❌ Lỗi thường gặp:

```
[PROXY ERROR] ECONNREFUSED
[PROXY ERROR] Backend should be running on http://localhost:3000
```

## ✅ Giải pháp:

### **Bước 1: Kiểm tra Backend có đang chạy không**

```bash
# Kiểm tra port 3000
netstat -ano | findstr :3000
```

**Nếu không thấy `LISTENING`** → Backend chưa chạy

**Nếu thấy `LISTENING`** → Backend đang chạy ✅

---

### **Bước 2: Khởi động Backend**

**Cách 1: Chạy trực tiếp**
```bash
npm start
```

**Cách 2: Dùng script tự động**
```bash
start-backend.bat
```

**Đợi đến khi thấy:**
```
✅ Database connected successfully
🚀 ====================================
✅ TravelGo API server is running on port 3000
🌐 URL: http://localhost:3000
🚀 ====================================
```

---

### **Bước 3: Kiểm tra Backend hoạt động**

**Test 1: Kiểm tra health**
```bash
curl http://localhost:3000
```

**Kết quả mong đợi:** `TravelGo API is running`

**Test 2: Kiểm tra API endpoint**
```bash
curl http://localhost:3000/api/auth/login
```

---

### **Bước 4: Khởi động Frontend**

**Chỉ chạy frontend SAU KHI backend đã chạy!**

```bash
npm run frontend
```

Hoặc:
```bash
cd frontend
npm start
```

---

## 🔍 Debug Proxy Error

### Script kiểm tra:
```bash
node check-backend-connection.js
```

**Kết quả:**
- ✅ `Backend is running!` → OK, có thể chạy frontend
- ❌ `Backend is NOT running!` → Cần chạy backend trước

---

## 📋 Checklist khi gặp Proxy Error:

1. [ ] Backend có đang chạy trên port 3000?
   ```bash
   netstat -ano | findstr :3000
   ```

2. [ ] Database có kết nối được không?
   ```bash
   node check-database.js
   ```

3. [ ] Backend có phản hồi không?
   ```bash
   curl http://localhost:3000
   ```

4. [ ] File `.env` có đúng không?
   - `DATABASE_URL=mysql://root:123456@localhost:3306/travelgo`
   - `PORT=3000`

5. [ ] Frontend proxy có đúng không?
   - Check `frontend/src/setupProxy.js`
   - Target: `http://localhost:3000`

---

## 🚨 Lỗi và Cách xử lý:

### 1. Port 3000 đã được sử dụng
```bash
# Tìm process
netstat -ano | findstr :3000

# Kill process (thay <PID> bằng số từ lệnh trên)
taskkill /PID <PID> /F

# Rồi chạy lại
npm start
```

### 2. Database connection failed
```bash
# Kiểm tra MySQL đang chạy
# Kiểm tra .env file
# Chạy lại migration nếu cần
npm run prisma:db push
npm run prisma:generate
```

### 3. Backend crash ngay sau khi start
- Xem log trong terminal để biết lỗi cụ thể
- Thường là lỗi database hoặc missing dependencies
- Chạy `node check-database.js` để kiểm tra

---

## 💡 Best Practice:

### Luôn chạy theo thứ tự:

1. ✅ **Backend trước** → Đợi đến khi thấy "✅ TravelGo API server is running"
2. ✅ **Frontend sau** → Mở terminal mới và chạy frontend

### Hoặc dùng `npm run dev:all`:

Chạy cả 2 cùng lúc, nhưng cần đảm bảo:
- Database đã kết nối
- Không có lỗi trong code
- Port 3000 và 3001 không bị chiếm

---

## 📞 Test API sau khi chạy:

```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"phong@triennguyen.com\",\"password\":\"Phong@2004\"}"
```

Nếu thấy response JSON với `token` → Backend hoạt động tốt ✅

---

**Tóm lại: Luôn đảm bảo Backend chạy TRƯỚC Frontend!** 🚀

