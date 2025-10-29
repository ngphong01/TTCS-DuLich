# 🚀 Quick Start Guide

## Tại sao có quá nhiều file scripts?

Trước đây có **18+ file scripts riêng biệt** vì mỗi file xử lý một vấn đề cụ thể trong quá trình phát triển NextAuth. Điều này gây ra:

- ❌ Khó quản lý
- ❌ Trùng lặp code
- ❌ Khó tìm script cần thiết
- ❌ Khó maintain

## ✅ Giải pháp: Unified Development Tool

Giờ đây **TẤT CẢ** đã được gộp vào **1 file duy nhất**: `unified-dev-tool.mjs`

## 🎯 Cách sử dụng

### 1. Chế độ Interactive (Khuyến nghị)

```bash
cd scripts
node unified-dev-tool.mjs
```

Sau đó chọn số từ menu:

```
📋 Available Commands:
==============================
1. 🔧 Fix Session Issues
2. 🔍 Debug Session State
3. 🔐 Generate NextAuth Secret
4. 🛠️  Fix Auth Callbacks
5. 🧹 Clean & Restart Server
6. 📊 Comprehensive System Check
7. 🚀 Start Server
8. 🔄 Restart & Test
9. 🗑️  Cleanup Old Scripts
0. ❌ Exit
==============================
```

### 2. Chế độ Command Line

```bash
# Fix session issues
node unified-dev-tool.mjs fix-session

# Debug session state
node unified-dev-tool.mjs debug

# Generate NextAuth secret
node unified-dev-tool.mjs generate-secret

# Fix auth callbacks
node unified-dev-tool.mjs fix-callbacks

# Clean and restart
node unified-dev-tool.mjs clean

# Comprehensive check
node unified-dev-tool.mjs check

# Start server only
node unified-dev-tool.mjs start

# Restart and test
node unified-dev-tool.mjs restart
```

## 📋 Mapping từ scripts cũ

| Script cũ                      | Chức năng mới                       |
| ------------------------------ | ----------------------------------- |
| `test-session-system.mjs`      | Option 8 (Restart & Test)           |
| `comprehensive-check.mjs`      | Option 6 (Comprehensive Check)      |
| `fix-logout-session.mjs`       | Option 1 (Fix Session Issues)       |
| `fix-navbar-logout.mjs`        | Option 1 (Fix Session Issues)       |
| `restart-and-test.mjs`         | Option 8 (Restart & Test)           |
| `fix-session-api.mjs`          | Option 1 (Fix Session Issues)       |
| `fix-session-callback.mjs`     | Option 4 (Fix Auth Callbacks)       |
| `fix-auth-callbacks.mjs`       | Option 4 (Fix Auth Callbacks)       |
| `fix-nextauth-error.mjs`       | Option 1 (Fix Session Issues)       |
| `restart-clean.mjs`            | Option 5 (Clean & Restart)          |
| `debug-session-detailed.mjs`   | Option 2 (Debug Session State)      |
| `fix-session.mjs`              | Option 1 (Fix Session Issues)       |
| `debug-session.mjs`            | Option 2 (Debug Session State)      |
| `fix-session-completely.mjs`   | Option 1 (Fix Session Issues)       |
| `fix-identified-issues.mjs`    | Option 1 (Fix Session Issues)       |
| `test-callback-system.mjs`     | Option 4 (Fix Auth Callbacks)       |
| `generate-nextauth-secret.mjs` | Option 3 (Generate NextAuth Secret) |
| `start-server.mjs`             | Option 7 (Start Server)             |

## 🎉 Lợi ích

✅ **1 file thay vì 18+ files**  
✅ **Tất cả chức năng trong một nơi**  
✅ **Menu rõ ràng, dễ sử dụng**  
✅ **Hướng dẫn chi tiết cho từng bước**  
✅ **Có thể dùng interactive hoặc command line**  
✅ **Dễ maintain và update**

## 🧹 Cleanup

Sau khi đã test tool mới, có thể xóa scripts cũ:

```bash
node unified-dev-tool.mjs cleanup
```

Hoặc chọn option 9 trong menu interactive.

## 📱 Test URLs

Sau khi chạy bất kỳ chức năng nào:

- **Home**: http://localhost:3000
- **Sign in**: http://localhost:3000/signin
- **Session**: http://localhost:3000/api/auth/session
- **Providers**: http://localhost:3000/api/auth/providers
- **Account**: http://localhost:3000/account

## ⚠️ Lưu ý

- Luôn backup trước khi cleanup
- Test kỹ tool mới trước khi xóa scripts cũ
- Nếu có vấn đề, có thể restore từ git history

---

**🎯 Kết luận**: Thay vì 18+ file scripts rời rạc, giờ đây chỉ cần 1 file `unified-dev-tool.mjs` với đầy đủ chức năng và dễ sử dụng hơn nhiều!
