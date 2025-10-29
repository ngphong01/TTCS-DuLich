# Google OAuth Setup Guide

## 🔧 Cấu hình Google OAuth Console

### 1. Truy cập Google Cloud Console

- Đi đến: https://console.cloud.google.com/
- Chọn project của bạn

### 2. Bật Google+ API

- Vào **APIs & Services** > **Library**
- Tìm "Google+ API" và bật nó

### 3. Cấu hình OAuth Consent Screen

- Vào **APIs & Services** > **OAuth consent screen**
- Chọn **External** (nếu chưa có)
- Điền thông tin:
  - **App name**: TravelGo
  - **User support email**: email của bạn
  - **Developer contact**: email của bạn

### 4. Tạo OAuth 2.0 Credentials

- Vào **APIs & Services** > **Credentials**
- Click **Create Credentials** > **OAuth 2.0 Client IDs**
- Chọn **Web application**
- Điền thông tin:
  - **Name**: TravelGo Web Client
  - **Authorized JavaScript origins**:
    - `http://localhost:3000`
  - **Authorized redirect URIs**:
    - `http://localhost:3000/api/auth/callback/google`

### 5. Lấy Client ID và Secret

- Copy **Client ID** và **Client Secret**
- Cập nhật vào `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## 🚨 Lỗi 400 - Các nguyên nhân thường gặp:

### 1. Redirect URI không khớp

- **Sai**: `http://localhost:3000/api/auth/oauth/google`
- **Đúng**: `http://localhost:3000/api/auth/callback/google`

### 2. Client ID/Secret sai

- Kiểm tra lại trong Google Console
- Đảm bảo không có khoảng trắng thừa

### 3. OAuth Consent Screen chưa được cấu hình

- Phải có ít nhất 1 test user
- App phải được verify (hoặc ở chế độ testing)

## 🔍 Debug Steps:

### 1. Kiểm tra URL redirect

```bash
# Test URL này trong browser
http://localhost:3000/api/auth/oauth/google
```

### 2. Kiểm tra logs

```bash
# Xem logs trong terminal khi click Google login
```

### 3. Kiểm tra Google Console

- Vào **APIs & Services** > **Credentials**
- Click vào OAuth 2.0 Client ID
- Kiểm tra **Authorized redirect URIs**

## ✅ Checklist:

- [ ] Google+ API đã được bật
- [ ] OAuth consent screen đã được cấu hình
- [ ] Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
- [ ] Client ID và Secret đúng trong `.env.local`
- [ ] Server đang chạy trên port 3000
- [ ] Không có khoảng trắng thừa trong credentials

## 🚀 Test sau khi cấu hình:

1. Mở `http://localhost:3000/signin`
2. Click "Đăng nhập với Google"
3. Nếu thành công, sẽ redirect về Google consent screen
4. Sau khi authorize, sẽ redirect về homepage
