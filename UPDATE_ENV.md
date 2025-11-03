# ⚠️ Cần Cập Nhật File .env

File `.env` hiện tại có thông tin database sai. Cần cập nhật:

## Cách sửa:

1. Mở file `.env` trong thư mục gốc
2. Thay đổi dòng:
   ```
   DATABASE_URL=mysql://app_user:app_password@localhost:3306/travelgo
   ```
   
   Thành:
   ```
   DATABASE_URL=mysql://root:123456@localhost:3306/travelgo
   ```

3. Đảm bảo các thông tin sau:
   ```
   PORT=3000
   FRONTEND_URL=http://localhost:3001
   ALLOWED_ORIGIN=http://localhost:3001
   DATABASE_URL=mysql://root:123456@localhost:3306/travelgo
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

Sau đó chạy lại: `npm run dev:all`

