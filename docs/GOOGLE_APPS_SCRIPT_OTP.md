# 🚀 Hệ Thống OTP với Google Apps Script - MIỄN PHÍ 100%

## Giới thiệu

Đây là phương án **"Ngon - Bổ - Rẻ"** nhất để xây dựng hệ thống xác thực OTP qua Email:
- ✅ **Miễn phí 100%** (dùng Gmail quota)
- ✅ **Không cần server riêng** cho email
- ✅ **Dễ setup** (chỉ cần Google Account)
- ✅ **Bảo mật** (OTP lưu trong Google Sheets)

## Cơ chế hoạt động

```
┌─────────────────────────────────────────────────────────────────┐
│                    LUỒNG XÁC THỰC OTP                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User nhập Email ──► Web App gọi API                        │
│                              │                                  │
│                              ▼                                  │
│  2. Google Apps Script ──► Tạo OTP 6 số                        │
│                              │                                  │
│                              ▼                                  │
│  3. Lưu vào Google Sheets (Email, OTP, Expiry)                 │
│                              │                                  │
│                              ▼                                  │
│  4. Gmail gửi OTP ──► User nhận email                          │
│                              │                                  │
│                              ▼                                  │
│  5. User nhập OTP ──► Script đối chiếu Sheets                  │
│                              │                                  │
│                              ▼                                  │
│  6. Đúng + Còn hạn ──► ✅ Cho vào                              │
│     Sai hoặc hết hạn ──► ❌ Từ chối                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Bước 1: Tạo Google Sheets

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo Spreadsheet mới, đặt tên: `OTP_Database`
3. Tạo Sheet với các cột:

| A | B | C | D | E |
|---|---|---|---|---|
| Email | OTP | ExpiresAt | CreatedAt | Verified |

4. Copy **Spreadsheet ID** từ URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

## Bước 2: Tạo Google Apps Script

1. Truy cập [Google Apps Script](https://script.google.com)
2. Tạo Project mới
3. Copy code sau vào `Code.gs`:

```javascript
// ============================================================================
// GOOGLE APPS SCRIPT - HỆ THỐNG OTP QUA EMAIL
// "Ngon - Bổ - Rẻ" - Miễn phí 100%
// ============================================================================

// CONFIGURATION
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE', // Thay bằng ID của bạn
  SHEET_NAME: 'Sheet1',
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  BRAND_NAME: 'TravelGo',
  FROM_NAME: 'TravelGo Security',
};

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Gửi OTP đến email
 * @param {string} email - Email nhận OTP
 * @param {string} purpose - Mục đích (optional)
 */
function sendOTP(email, purpose = 'xác thực') {
  try {
    // Validate email
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Email không hợp lệ' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check cooldown (1 minute between requests)
    const existing = getOTPByEmail(normalizedEmail);
    if (existing && !isExpired(existing.expiresAt)) {
      const timeSinceCreated = (new Date() - new Date(existing.createdAt)) / 1000;
      if (timeSinceCreated < 60) {
        const waitTime = Math.ceil(60 - timeSinceCreated);
        return { 
          success: false, 
          error: `Vui lòng chờ ${waitTime} giây trước khi yêu cầu mã mới`,
          code: 'COOLDOWN'
        };
      }
    }

    // Generate OTP
    const otp = generateOTP(CONFIG.OTP_LENGTH);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + CONFIG.OTP_EXPIRY_MINUTES);

    // Save to Sheet
    saveOTP(normalizedEmail, otp, expiresAt);

    // Send email
    const emailSent = sendOTPEmail(normalizedEmail, otp, purpose);
    if (!emailSent) {
      return { success: false, error: 'Không thể gửi email' };
    }

    return {
      success: true,
      message: `Mã OTP đã được gửi đến ${normalizedEmail}`,
      expiresAt: expiresAt.toISOString(),
      expiryMinutes: CONFIG.OTP_EXPIRY_MINUTES,
    };

  } catch (error) {
    console.error('sendOTP error:', error);
    return { success: false, error: 'Đã xảy ra lỗi: ' + error.message };
  }
}

/**
 * Xác thực OTP
 * @param {string} email - Email đã nhận OTP
 * @param {string} code - Mã OTP người dùng nhập
 */
function verifyOTP(email, code) {
  try {
    if (!email || !code) {
      return { success: false, error: 'Email và mã OTP là bắt buộc' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.toString().trim();

    // Get stored OTP
    const stored = getOTPByEmail(normalizedEmail);

    if (!stored) {
      return { 
        success: false, 
        error: 'Không tìm thấy mã OTP. Vui lòng yêu cầu mã mới.',
        code: 'NOT_FOUND'
      };
    }

    // Check expiry
    if (isExpired(stored.expiresAt)) {
      deleteOTP(normalizedEmail);
      return { 
        success: false, 
        error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
        code: 'EXPIRED'
      };
    }

    // Verify code
    if (stored.otp !== normalizedCode) {
      return { 
        success: false, 
        error: 'Mã OTP không đúng',
        code: 'INVALID'
      };
    }

    // Success - mark as verified and delete
    markVerified(normalizedEmail);

    return {
      success: true,
      message: 'Xác thực thành công!',
      email: normalizedEmail,
      verifiedAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error('verifyOTP error:', error);
    return { success: false, error: 'Đã xảy ra lỗi: ' + error.message };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate random OTP
 */
function generateOTP(length) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Check if OTP is expired
 */
function isExpired(expiresAt) {
  return new Date() > new Date(expiresAt);
}

/**
 * Get Sheet reference
 */
function getSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  return ss.getSheetByName(CONFIG.SHEET_NAME);
}

/**
 * Get OTP by email
 */
function getOTPByEmail(email) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === email.toLowerCase()) {
      return {
        email: data[i][0],
        otp: data[i][1].toString(),
        expiresAt: data[i][2],
        createdAt: data[i][3],
        verified: data[i][4],
        row: i + 1,
      };
    }
  }
  return null;
}

/**
 * Save OTP to sheet
 */
function saveOTP(email, otp, expiresAt) {
  const sheet = getSheet();
  const existing = getOTPByEmail(email);
  const now = new Date();

  if (existing) {
    // Update existing row
    sheet.getRange(existing.row, 1, 1, 5).setValues([
      [email, otp, expiresAt, now, false]
    ]);
  } else {
    // Append new row
    sheet.appendRow([email, otp, expiresAt, now, false]);
  }
}

/**
 * Delete OTP
 */
function deleteOTP(email) {
  const sheet = getSheet();
  const existing = getOTPByEmail(email);
  if (existing) {
    sheet.deleteRow(existing.row);
  }
}

/**
 * Mark OTP as verified
 */
function markVerified(email) {
  const sheet = getSheet();
  const existing = getOTPByEmail(email);
  if (existing) {
    sheet.getRange(existing.row, 5).setValue(true);
    // Optionally delete after verification
    // sheet.deleteRow(existing.row);
  }
}

/**
 * Send OTP via Gmail
 */
function sendOTPEmail(email, otp, purpose) {
  try {
    const subject = `🔐 Mã xác thực OTP - ${CONFIG.BRAND_NAME}`;
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .body { padding: 40px; text-align: center; }
          .otp-box { background: #f0f9ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af; font-family: monospace; }
          .expiry { background: #fef3c7; color: #92400e; padding: 12px 20px; border-radius: 20px; display: inline-block; margin-top: 20px; font-weight: bold; }
          .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; text-align: left; border-radius: 8px; }
          .footer { background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Mã xác thực OTP</h1>
          </div>
          <div class="body">
            <p>Bạn đang yêu cầu <strong>${purpose}</strong> tại <strong>${CONFIG.BRAND_NAME}</strong></p>
            
            <div class="otp-box">
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">MÃ XÁC THỰC CỦA BẠN</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry">⏰ Mã có hiệu lực trong ${CONFIG.OTP_EXPIRY_MINUTES} phút</div>
            
            <div class="warning">
              <strong>🛡️ Lưu ý bảo mật:</strong><br>
              • Không chia sẻ mã này với bất kỳ ai<br>
              • ${CONFIG.BRAND_NAME} không bao giờ yêu cầu mã OTP qua điện thoại
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} ${CONFIG.BRAND_NAME}. Email tự động - Vui lòng không trả lời.
          </div>
        </div>
      </body>
      </html>
    `;

    GmailApp.sendEmail(email, subject, `Mã OTP của bạn: ${otp}. Có hiệu lực trong ${CONFIG.OTP_EXPIRY_MINUTES} phút.`, {
      name: CONFIG.FROM_NAME,
      htmlBody: htmlBody,
    });

    return true;
  } catch (error) {
    console.error('sendOTPEmail error:', error);
    return false;
  }
}

// ============================================================================
// WEB APP ENDPOINTS
// ============================================================================

/**
 * Handle GET requests
 */
function doGet(e) {
  const action = e.parameter.action;
  const email = e.parameter.email;
  const code = e.parameter.code;

  let result;

  switch (action) {
    case 'send':
      result = sendOTP(email, e.parameter.purpose);
      break;
    case 'verify':
      result = verifyOTP(email, code);
      break;
    default:
      result = { success: false, error: 'Invalid action' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    let result;

    switch (action) {
      case 'send':
        result = sendOTP(data.email, data.purpose);
        break;
      case 'verify':
        result = verifyOTP(data.email, data.code);
        break;
      default:
        result = { success: false, error: 'Invalid action' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// CLEANUP FUNCTION (Run daily via Trigger)
// ============================================================================

/**
 * Clean up expired OTPs - Set this as a daily trigger
 */
function cleanupExpiredOTPs() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  let deletedCount = 0;

  // Go from bottom to top to avoid row shifting issues
  for (let i = data.length - 1; i >= 1; i--) {
    const expiresAt = new Date(data[i][2]);
    if (now > expiresAt) {
      sheet.deleteRow(i + 1);
      deletedCount++;
    }
  }

  console.log(`Cleaned up ${deletedCount} expired OTPs`);
  return { cleaned: deletedCount };
}
```

## Bước 3: Deploy Web App

1. Trong Apps Script, click **Deploy** → **New deployment**
2. Chọn type: **Web app**
3. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone** (hoặc "Anyone with Google Account" nếu muốn bảo mật hơn)
4. Click **Deploy**
5. Copy **Web app URL** (dạng: `https://script.google.com/macros/s/xxx/exec`)

## Bước 4: Sử dụng API

### Gửi OTP (GET)
```
GET https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=send&email=user@example.com&purpose=đăng%20nhập
```

### Gửi OTP (POST)
```javascript
fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
  method: 'POST',
  body: JSON.stringify({
    action: 'send',
    email: 'user@example.com',
    purpose: 'đăng nhập'
  })
})
```

### Xác thực OTP (POST)
```javascript
fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
  method: 'POST',
  body: JSON.stringify({
    action: 'verify',
    email: 'user@example.com',
    code: '123456'
  })
})
```

## Bước 5: Setup Cleanup Trigger

1. Trong Apps Script, click **Triggers** (biểu tượng đồng hồ)
2. Click **Add Trigger**
3. Settings:
   - Function: `cleanupExpiredOTPs`
   - Event source: **Time-driven**
   - Type: **Day timer**
   - Time: **Midnight to 1am**
4. Save

## Giới hạn

| Giới hạn | Giá trị |
|----------|---------|
| Email/ngày (Gmail) | 100 (free) / 1,500 (Workspace) |
| Script execution | 6 phút/lần |
| Spreadsheet cells | 10 triệu cells |

## Tích hợp với TravelGo

Thêm vào `frontend/src/services/otpService.ts`:

```typescript
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL';

export const googleOtpService = {
  async sendOTP(email: string, purpose?: string) {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'send', email, purpose }),
    });
    return response.json();
  },

  async verifyOTP(email: string, code: string) {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', email, code }),
    });
    return response.json();
  },
};
```

## So sánh 2 phương án

| Tiêu chí | Nodemailer | Google Apps Script |
|----------|------------|-------------------|
| Chi phí | Tùy SMTP provider | **Miễn phí** |
| Setup | Cần config SMTP | Chỉ cần Google Account |
| Giới hạn | Tùy provider | 100 email/ngày |
| Tốc độ | Nhanh | Chậm hơn (~2-5s) |
| Độ tin cậy | Cao | Trung bình |
| Phù hợp | Production | MVP/Side project |

## Kết luận

- **Dùng Google Apps Script** nếu: MVP, side project, ít user (<100/ngày)
- **Dùng Nodemailer** nếu: Production, nhiều user, cần độ tin cậy cao

---

**Happy Coding! 🚀**

