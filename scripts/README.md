# NextJS Starter - Unified Development Tool

## 🚀 Tổng quan

Thay vì có 18+ file scripts riêng biệt, giờ đây tất cả chức năng đã được gộp vào một file duy nhất: `unified-dev-tool.mjs`

## 📋 Các chức năng có sẵn

### 1. 🔧 Fix Session Issues

- Dừng tất cả process Node.js
- Xóa cache build (.next)
- Xóa cache node_modules
- Khởi động lại server
- Hướng dẫn test session

### 2. 🔍 Debug Session State

- Kiểm tra file .env.local
- Phân tích cấu hình NextAuth
- Đưa ra các nguyên nhân phổ biến
- Hướng dẫn debug chi tiết

### 3. 🔐 Generate NextAuth Secret

- Tạo NEXTAUTH_SECRET mới
- Cập nhật file .env.local
- Tạo file .env.local nếu chưa có
- Xác minh secret đã được lưu

### 4. 🛠️ Fix Auth Callbacks

- Sửa session callback với null checks
- Sửa token callback với null checks
- Cập nhật file auth.ts
- Hướng dẫn test sau khi sửa

### 5. 🧹 Clean & Restart Server

- Dừng tất cả process
- Xóa toàn bộ cache
- Khởi động lại server

### 6. 📊 Comprehensive System Check

- Kiểm tra tất cả biến môi trường
- Kiểm tra file auth.ts
- Kiểm tra dependencies
- Đưa ra báo cáo tổng quan

### 7. 🚀 Start Server

- Chỉ khởi động server
- Không xóa cache
- Hướng dẫn test cơ bản

### 8. 🔄 Restart & Test

- Restart server với test session
- Hướng dẫn test chi tiết
- Debug URLs

### 9. 🗑️ Cleanup Old Scripts

- Xóa tất cả file scripts cũ
- Giữ lại chỉ unified-dev-tool.mjs

## 🎯 Cách sử dụng

### Chế độ Interactive (Khuyến nghị)

```bash
node scripts/unified-dev-tool.mjs
```

Sau đó chọn số từ 1-9 để thực hiện chức năng tương ứng.

### Chế độ Command Line

```bash
# Fix session issues
node scripts/unified-dev-tool.mjs fix-session

# Debug session state
node scripts/unified-dev-tool.mjs debug

# Generate NextAuth secret
node scripts/unified-dev-tool.mjs generate-secret

# Fix auth callbacks
node scripts/unified-dev-tool.mjs fix-callbacks

# Clean and restart
node scripts/unified-dev-tool.mjs clean

# Comprehensive check
node scripts/unified-dev-tool.mjs check

# Start server only
node scripts/unified-dev-tool.mjs start

# Restart and test
node scripts/unified-dev-tool.mjs restart

# Cleanup old scripts
node scripts/unified-dev-tool.mjs cleanup
```

## 🔄 Migration từ scripts cũ

### Scripts cũ đã được gộp:

- `test-session-system.mjs` → Option 8 (Restart & Test)
- `comprehensive-check.mjs` → Option 6 (Comprehensive Check)
- `fix-logout-session.mjs` → Option 1 (Fix Session Issues)
- `fix-navbar-logout.mjs` → Option 1 (Fix Session Issues)
- `restart-and-test.mjs` → Option 8 (Restart & Test)
- `fix-session-api.mjs` → Option 1 (Fix Session Issues)
- `fix-session-callback.mjs` → Option 4 (Fix Auth Callbacks)
- `fix-auth-callbacks.mjs` → Option 4 (Fix Auth Callbacks)
- `fix-nextauth-error.mjs` → Option 1 (Fix Session Issues)
- `restart-clean.mjs` → Option 5 (Clean & Restart)
- `debug-session-detailed.mjs` → Option 2 (Debug Session State)
- `fix-session.mjs` → Option 1 (Fix Session Issues)
- `debug-session.mjs` → Option 2 (Debug Session State)
- `fix-session-completely.mjs` → Option 1 (Fix Session Issues)
- `fix-identified-issues.mjs` → Option 1 (Fix Session Issues)
- `test-callback-system.mjs` → Option 4 (Fix Auth Callbacks)
- `generate-nextauth-secret.mjs` → Option 3 (Generate NextAuth Secret)
- `start-server.mjs` → Option 7 (Start Server)

## ✅ Lợi ích

1. **Dễ quản lý**: Chỉ 1 file thay vì 18+ files
2. **Tích hợp**: Tất cả chức năng trong một nơi
3. **Linh hoạt**: Có thể dùng interactive hoặc command line
4. **Đầy đủ**: Gộp tất cả chức năng từ scripts cũ
5. **Dễ sử dụng**: Menu rõ ràng, hướng dẫn chi tiết

## 🧹 Cleanup

Sau khi đã test và đảm bảo tool mới hoạt động tốt, có thể chạy:

```bash
node scripts/unified-dev-tool.mjs cleanup
```

Hoặc chọn option 9 trong menu interactive để xóa tất cả scripts cũ.

## 📱 Test URLs

Sau khi chạy bất kỳ chức năng nào, có thể test tại:

- **Home**: http://localhost:3000
- **Sign in**: http://localhost:3000/signin
- **Session**: http://localhost:3000/api/auth/session
- **Providers**: http://localhost:3000/api/auth/providers
- **Account**: http://localhost:3000/account

## ⚠️ Lưu ý

- Luôn backup trước khi cleanup scripts cũ
- Test kỹ tool mới trước khi xóa scripts cũ
- Nếu có vấn đề, có thể restore từ git history
