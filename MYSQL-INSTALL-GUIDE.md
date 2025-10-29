# Hướng dẫn cài đặt MySQL cho Windows

## 🚀 Cách 1: XAMPP (Khuyến nghị cho người mới)

### Bước 1: Tải XAMPP

1. Truy cập: https://www.apachefriends.org/download.html
2. Tải phiên bản mới nhất cho Windows
3. Chạy installer với quyền Administrator

### Bước 2: Khởi động MySQL

1. Mở XAMPP Control Panel
2. Click "Start" cho MySQL
3. MySQL sẽ chạy trên port 3306

### Bước 3: Cấu hình DATABASE_URL

```env
DATABASE_URL="mysql://root:@localhost:3306/nextjs_starter"
```

## 🚀 Cách 2: MySQL Community Server

### Bước 1: Tải MySQL

1. Truy cập: https://dev.mysql.com/downloads/mysql/
2. Chọn "MySQL Community Server"
3. Tải file .msi installer

### Bước 2: Cài đặt

1. Chạy installer với quyền Administrator
2. Chọn "Developer Default"
3. Thiết lập root password
4. Hoàn thành cài đặt

### Bước 3: Khởi động MySQL Service

```cmd
# Mở Command Prompt as Administrator
net start mysql
```

### Bước 4: Cấu hình DATABASE_URL

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/nextjs_starter"
```

## 🚀 Cách 3: Docker (Nếu có Docker Desktop)

### Bước 1: Cài Docker Desktop

1. Tải Docker Desktop từ: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop

### Bước 2: Chạy MySQL Container

```bash
docker-compose up -d
```

### Bước 3: Cấu hình DATABASE_URL

```env
DATABASE_URL="mysql://app_user:app_password@localhost:3306/nextjs_starter"
```

## 🔧 Kiểm tra MySQL đã chạy

### Kiểm tra service

```cmd
# Windows Services
services.msc
# Tìm "MySQL" và kiểm tra trạng thái "Running"
```

### Kiểm tra port

```cmd
netstat -an | findstr :3306
```

### Kết nối MySQL

```cmd
mysql -u root -p
# Nhập password khi được yêu cầu
```

## 🚀 Sau khi MySQL chạy

### Chạy setup tự động

```bash
npm run mysql:setup
```

### Hoặc chạy migration

```bash
npm run mysql:migrate
```

### Khởi động ứng dụng

```bash
npm run dev
```

## 🛠️ Troubleshooting

### Lỗi "Access denied"

- Kiểm tra username/password
- Đảm bảo user có quyền truy cập database

### Lỗi "Connection refused"

- Kiểm tra MySQL service đang chạy
- Kiểm tra port 3306 không bị block

### Lỗi "Database not found"

- Tạo database: `CREATE DATABASE nextjs_starter;`
- Hoặc để script tự động tạo

## 💡 Khuyến nghị

**Cho người mới:** Sử dụng XAMPP - đơn giản và dễ sử dụng
**Cho developer:** Sử dụng MySQL Community Server
**Cho production:** Sử dụng Docker hoặc MySQL Server chuyên dụng
