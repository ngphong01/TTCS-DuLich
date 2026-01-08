# 🚀 Hướng dẫn Deploy TravelGo

## 📁 Cấu trúc Production Build

```
Travelgo/
├── backend/           # API Server (Node.js + Express)
│   ├── .env          # Environment variables
│   └── ...
├── frontend/
│   └── build/        # Static files để deploy
│       ├── static/
│       │   ├── js/   # JavaScript bundles
│       │   └── css/  # Stylesheets
│       └── index.html
└── ...
```

## 🔧 Các bước Deploy

### 1. Build Frontend

```bash
cd frontend
npm run build
```

Build folder sẽ được tạo tại `frontend/build/`

### 2. Cấu hình Environment Variables

#### Backend (.env)
```env
# Server
PORT=3000
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGIN=https://your-domain.com

# Database
DATABASE_URL=mysql://user:password@host:3306/travelgo

# JWT
JWT_SECRET=your-production-secret-key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend (.env)
```env
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_BACKEND_URL=https://api.your-domain.com
```

### 3. Options Deploy

---

## Option A: Deploy trên cùng Server (VPS/Cloud)

### Nginx Config

```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/travelgo/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 cho Backend

```bash
cd backend
npm install
npx prisma generate
pm2 start index.js --name travelgo-api
pm2 save
pm2 startup
```

---

## Option B: Vercel (Frontend) + Railway/Render (Backend)

### Frontend trên Vercel

1. Push code lên GitHub
2. Kết nối repo với Vercel
3. Settings:
   - Framework: Create React App
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/build`
4. Environment Variables:
   - `REACT_APP_API_URL` = Backend URL

### Backend trên Railway/Render

1. Kết nối repo
2. Root Directory: `backend`
3. Build Command: `npm install && npx prisma generate`
4. Start Command: `npm start`
5. Environment Variables: Copy từ `.env`

---

## Option C: Docker

### Dockerfile cho Backend

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
```

### Dockerfile cho Frontend

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    env_file:
      - backend/.env
    depends_on:
      - db
      
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
      
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: travelgo
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

---

## Option D: Netlify (Frontend) + Fly.io (Backend)

### Frontend trên Netlify

1. Kết nối GitHub repo
2. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
3. Add `_redirects` file trong `frontend/public/`:
   ```
   /api/*  https://your-backend.fly.dev/api/:splat  200
   /*      /index.html   200
   ```

### Backend trên Fly.io

```bash
cd backend
fly launch
fly secrets set DATABASE_URL="mysql://..." JWT_SECRET="..."
fly deploy
```

---

## 🔐 Checklist Security cho Production

- [ ] Thay đổi JWT_SECRET thành chuỗi ngẫu nhiên mạnh
- [ ] Bật HTTPS (SSL certificate)
- [ ] Cấu hình CORS đúng domain
- [ ] Ẩn error details trong production
- [ ] Setup rate limiting
- [ ] Backup database định kỳ
- [ ] Monitor logs và performance

---

## 📊 Test Production Build Local

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend (serve build)
cd frontend
npx serve -s build -l 3001
```

Truy cập: http://localhost:3001

---

## 🆘 Troubleshooting

### API không kết nối được
- Kiểm tra `REACT_APP_API_URL` trong frontend `.env`
- Rebuild frontend sau khi thay đổi env
- Kiểm tra CORS settings trong backend

### Database connection failed
- Kiểm tra `DATABASE_URL` format
- Đảm bảo database server đang chạy
- Kiểm tra firewall rules

### Build failed
- Xóa `node_modules` và `package-lock.json`, chạy lại `npm install`
- Kiểm tra TypeScript errors: `npm run build 2>&1`

