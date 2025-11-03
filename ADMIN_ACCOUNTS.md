# 🔐 Tài khoản Admin có sẵn

Sau khi chạy `npm run prisma:seed`, có 2 tài khoản admin:

## Admin 1:
- **Email**: `admin@travelgo.dev`
- **Password**: `admin123`
- **Role**: ADMIN

## Admin 2:
- **Email**: `phong@triennguyen.com`
- **Password**: `Phong@2004`
- **Role**: ADMIN

## Cách seed database:
```bash
npm run prisma:seed
```

---

## Kiểm tra admin đã tồn tại:
```sql
SELECT id, email, name, role FROM User WHERE role = 'ADMIN';
```

