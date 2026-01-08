# 🔐 Hệ Thống Xác Thực OTP qua Email - TravelGo

## Tổng quan

Hệ thống OTP (One-Time Password) giúp **xác thực email** và **đăng nhập không cần mật khẩu** (passwordless login).

### Tính năng
- ✅ Gửi mã OTP 6 số qua email
- ✅ Tự động hết hạn sau 10 phút
- ✅ Giới hạn 5 lần thử sai
- ✅ Cooldown 1 phút giữa các lần gửi
- ✅ Rate limiting theo IP
- ✅ Hỗ trợ đăng nhập không cần mật khẩu
- ✅ UI/UX đẹp với animations

## Kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                    HỆ THỐNG OTP - TRAVELGO                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend                    Backend                            │
│  ┌──────────────┐           ┌──────────────┐                   │
│  │ OTPVerifica- │  ──────►  │ /api/otp/    │                   │
│  │ tion.tsx     │           │ send         │                   │
│  │              │  ◄──────  │ verify       │                   │
│  │ • Email form │           │ resend       │                   │
│  │ • OTP inputs │           │ status       │                   │
│  │ • Animations │           │ cancel       │                   │
│  └──────────────┘           └──────────────┘                   │
│                                    │                            │
│                                    ▼                            │
│                            ┌──────────────┐                     │
│                            │ lib/emailOtp │                     │
│                            │ .js          │                     │
│                            │              │                     │
│                            │ • Generate   │                     │
│                            │ • Store      │                     │
│                            │ • Verify     │                     │
│                            │ • Cleanup    │                     │
│                            └──────────────┘                     │
│                                    │                            │
│                         ┌─────────┴─────────┐                  │
│                         ▼                   ▼                   │
│                  ┌────────────┐      ┌────────────┐            │
│                  │ In-Memory  │      │ Database   │            │
│                  │ Store      │      │ (Prisma)   │            │
│                  │ (Default)  │      │ (Optional) │            │
│                  └────────────┘      └────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. Gửi OTP
```http
POST /api/otp/send
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "xác thực email"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mã OTP đã được gửi đến user@example.com",
  "expiresAt": "2024-01-15T10:30:00.000Z",
  "expiryMinutes": 10
}
```

### 2. Xác thực OTP
```http
POST /api/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Xác thực thành công!",
  "email": "user@example.com",
  "verifiedAt": "2024-01-15T10:25:00.000Z"
}
```

### 3. Xác thực + Đăng nhập (Passwordless)
```http
POST /api/otp/verify-and-login
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User",
    "role": "USER"
  }
}
```

### 4. Gửi lại OTP
```http
POST /api/otp/resend
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 5. Kiểm tra trạng thái
```http
GET /api/otp/status?email=user@example.com
```

**Response:**
```json
{
  "success": true,
  "exists": true,
  "isExpired": false,
  "remainingSeconds": 542,
  "attempts": 1,
  "maxAttempts": 5,
  "remainingAttempts": 4
}
```

### 6. Hủy OTP
```http
POST /api/otp/cancel
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## Sử dụng Frontend Component

### Basic Usage
```tsx
import { OTPVerification } from '@/components/auth/OTPVerification';

function LoginPage() {
  return (
    <OTPVerification
      onSuccess={(data) => {
        console.log('Verified!', data);
        // Redirect to dashboard
      }}
      onCancel={() => {
        // Go back
      }}
    />
  );
}
```

### With Pre-filled Email
```tsx
<OTPVerification
  email="user@example.com"
  autoSend={true}
  onSuccess={(data) => console.log(data)}
/>
```

### Passwordless Login Mode
```tsx
<OTPVerification
  mode="login"
  purpose="đăng nhập"
  onSuccess={(data) => {
    // data.token is available
    // data.user contains user info
    localStorage.setItem('token', data.token);
    window.location.href = '/dashboard';
  }}
/>
```

### Compact OTP Input
```tsx
import { OTPInput } from '@/components/auth/OTPVerification';

function MyForm() {
  const [otp, setOtp] = useState('');
  
  return (
    <OTPInput
      value={otp}
      onChange={setOtp}
      length={6}
      error={hasError}
    />
  );
}
```

## Cấu hình

### Environment Variables
```env
# Email Configuration (for Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Or use OAuth2
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REFRESH_TOKEN=xxx
GMAIL_USER=your-email@gmail.com

# JWT for passwordless login
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

### OTP Configuration
Chỉnh sửa trong `lib/emailOtp.js`:
```javascript
const OTP_CONFIG = {
  length: 6,                    // Độ dài mã OTP
  expiryMinutes: 10,            // Thời gian hết hạn
  maxAttempts: 5,               // Số lần thử tối đa
  cooldownMinutes: 1,           // Cooldown giữa các lần gửi
  cleanupIntervalMinutes: 15,   // Dọn dẹp OTP hết hạn
};
```

## Chọn Storage Mode

### 1. In-Memory Store (Default)
- **File:** `lib/emailOtp.js`
- **Ưu điểm:** Nhanh, không cần database
- **Nhược điểm:** Mất data khi restart server
- **Phù hợp:** Single server, development

```javascript
const { sendEmailOTP, verifyEmailOTP } = require('./lib/emailOtp');
```

### 2. Database Store (Production)
- **File:** `lib/emailOtpDb.js`
- **Ưu điểm:** Persistent, multi-server support
- **Nhược điểm:** Cần migrate database
- **Phù hợp:** Production, multiple instances

```javascript
const { sendEmailOTP, verifyEmailOTP } = require('./lib/emailOtpDb');
```

**Migrate database:**
```bash
npx prisma migrate dev --name add_email_otp
```

## Error Codes

| Code | Mô tả |
|------|-------|
| `INVALID_EMAIL` | Email không hợp lệ |
| `COOLDOWN` | Đang trong thời gian chờ |
| `OTP_NOT_FOUND` | Không tìm thấy OTP |
| `OTP_EXPIRED` | OTP đã hết hạn |
| `INVALID_OTP` | Mã OTP không đúng |
| `MAX_ATTEMPTS` | Vượt quá số lần thử |
| `EMAIL_FAILED` | Không gửi được email |
| `RATE_LIMITED` | Quá nhiều request |
| `INTERNAL_ERROR` | Lỗi hệ thống |

## Security Best Practices

1. **Rate Limiting:** Giới hạn 5 request/15 phút/IP
2. **Cooldown:** 1 phút giữa các lần gửi
3. **Max Attempts:** 5 lần thử sai → xóa OTP
4. **Expiry:** OTP hết hạn sau 10 phút
5. **Secure Generation:** Dùng `crypto.randomBytes()` cho production
6. **No OTP in Response:** Không trả về OTP trong production

## Testing

### Manual Testing
```bash
# Gửi OTP
curl -X POST http://localhost:3000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Xác thực OTP
curl -X POST http://localhost:3000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'
```

### Development Mode
Trong development, OTP code sẽ được trả về trong response để dễ test:
```json
{
  "success": true,
  "message": "Mã OTP đã được gửi",
  "code": "123456"  // Chỉ có trong development!
}
```

## So sánh các phương án

| Tiêu chí | In-Memory | Database | Google Apps Script |
|----------|-----------|----------|-------------------|
| Chi phí | Free | Free | Free |
| Setup | Dễ | Trung bình | Dễ |
| Tốc độ | Rất nhanh | Nhanh | Chậm (2-5s) |
| Persistence | ❌ | ✅ | ✅ |
| Multi-server | ❌ | ✅ | ✅ |
| Email quota | Tùy SMTP | Tùy SMTP | 100/ngày |
| Phù hợp | Dev | Production | MVP |

## Troubleshooting

### Email không gửi được
1. Kiểm tra SMTP config trong `.env`
2. Nếu dùng Gmail, bật "Less secure apps" hoặc dùng App Password
3. Check logs: `EMAIL_MODE=log` để debug

### OTP không verify được
1. Kiểm tra thời gian hết hạn
2. Kiểm tra số lần thử
3. Đảm bảo email đúng format (lowercase)

### Rate limit
1. Chờ 15 phút
2. Hoặc restart server (development)

---

**Happy Coding! 🚀**

