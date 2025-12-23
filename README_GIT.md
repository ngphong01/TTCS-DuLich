# 📤 Hướng dẫn Commit Code lên Git

## ✅ Đảm bảo các file quan trọng được commit

Khi commit code lên Git, đảm bảo các file sau được include:

### 🖼️ Hình ảnh và Logo

```bash
# Logo
uploads/Logo/logo.png
frontend/public/logo.png

# Ảnh destinations seed (46+ ảnh)
uploads/avatars/ha-long4.jpg
uploads/avatars/phu-quoc.jpg
uploads/avatars/ha-noi.jpg
uploads/avatars/da-lat.jpg
# ... và tất cả các ảnh destinations khác
```

### 🗄️ Database Files

```bash
database/travelgo_complete.sql          # SQL file đầy đủ
database/travelgo_extended_data.sql    # Extended data (nếu có)
prisma/seed.js                          # Seed script
```

### 📝 Documentation và Scripts

```bash
SETUP.md                    # Hướng dẫn setup
GIT_SETUP.md               # Hướng dẫn Git
README.md                   # Tài liệu chính
scripts/setup-database.*    # Setup scripts
.gitignore                  # Git ignore rules
.gitattributes              # Git attributes
```

## 🚀 Quy trình Commit

### 1. Kiểm tra file sẽ commit

```bash
git status
```

### 2. Add các file cần thiết

```bash
# Add tất cả (trừ .env và node_modules)
git add .

# Hoặc add cụ thể:
git add uploads/Logo/
git add uploads/avatars/*.jpg
git add uploads/avatars/*.png
git add database/*.sql
git add prisma/seed.js
git add SETUP.md
git add scripts/
git add .gitignore
```

### 3. Verify trước khi commit

```bash
# Xem các file sẽ được commit
git status

# Kiểm tra xem file có bị ignore không
git check-ignore -v uploads/Logo/logo.png
git check-ignore -v uploads/avatars/ha-long4.jpg
```

### 4. Commit

```bash
git commit -m "feat: Add complete setup with seed data and images

- Add logo and 46+ destination seed images
- Add complete database SQL files  
- Add Prisma seed script
- Add setup scripts and documentation
- Update .gitignore to keep seed images"
```

### 5. Push

```bash
git push origin main
```

## 🔍 Verify sau khi Push

Kiểm tra trên GitHub/GitLab:

1. ✅ Logo: `uploads/Logo/logo.png` hiển thị
2. ✅ Ảnh: `uploads/avatars/` có ~46+ files
3. ✅ SQL: `database/travelgo_complete.sql` có nội dung
4. ✅ Docs: `SETUP.md` hiển thị

## ⚠️ Lưu ý

- ❌ **KHÔNG** commit `.env` (chứa secrets)
- ❌ **KHÔNG** commit `node_modules/` (quá lớn)
- ✅ **NÊN** commit logo và seed images
- ✅ **NÊN** commit SQL files và seed scripts

## 📋 Checklist

Trước khi push, đảm bảo:

- [ ] Logo được commit
- [ ] Ảnh destinations được commit (46+ files)
- [ ] SQL files được commit
- [ ] Seed script được commit
- [ ] Setup docs được commit
- [ ] `.env` KHÔNG được commit
- [ ] `node_modules/` KHÔNG được commit

Xem chi tiết: [GIT_SETUP.md](./GIT_SETUP.md)

