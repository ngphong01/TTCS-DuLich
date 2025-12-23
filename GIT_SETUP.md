# 📤 Hướng dẫn Commit và Push lên Git

Hướng dẫn để đảm bảo tất cả file cần thiết (logo, ảnh, database) được commit đúng cách.

## ✅ Checklist trước khi commit

### 1. Kiểm tra các file sẽ được commit

```bash
# Xem các file đã thay đổi
git status

# Xem các file sẽ được commit (bao gồm cả untracked)
git status --untracked-files=all
```

### 2. Đảm bảo các file quan trọng được add

```bash
# Thêm tất cả file (trừ những file trong .gitignore)
git add .

# Hoặc add từng phần:
git add uploads/Logo/          # Logo
git add uploads/avatars/*.jpg  # Ảnh destinations
git add uploads/avatars/*.png
git add frontend/public/logo.png
git add database/*.sql          # SQL files
git add prisma/seed.js          # Seed script
git add SETUP.md                # Hướng dẫn setup
git add scripts/                # Setup scripts
```

### 3. Kiểm tra .gitignore

Đảm bảo `.gitignore` không ignore các file cần thiết:

```bash
# Kiểm tra xem file có bị ignore không
git check-ignore -v uploads/Logo/logo.png
git check-ignore -v uploads/avatars/ha-long4.jpg
git check-ignore -v database/travelgo_complete.sql
```

Nếu có output, file đó đang bị ignore. Cần sửa `.gitignore`.

## 📝 Quy trình commit

### Bước 1: Kiểm tra file sẽ commit

```bash
git status
```

Đảm bảo thấy:

- ✅ `uploads/Logo/logo.png`
- ✅ `uploads/avatars/*.jpg` (các ảnh destinations)
- ✅ `database/travelgo_complete.sql`
- ✅ `database/travelgo_extended_data.sql`
- ✅ `prisma/seed.js`
- ✅ `SETUP.md`
- ✅ `scripts/setup-database.*`

### Bước 2: Add các file

```bash
# Add tất cả (trừ .env và node_modules)
git add .

# Hoặc add cụ thể:
git add uploads/
git add database/
git add prisma/seed.js
git add SETUP.md
git add scripts/
git add .gitignore
git add package.json
```

### Bước 3: Commit

```bash
git commit -m "feat: Add complete setup with seed data, images, and database

- Add logo and destination images (46+ images)
- Add complete database SQL files
- Add Prisma seed script with full data
- Add setup scripts for easy installation
- Update .gitignore to keep seed images
- Add comprehensive setup documentation"
```

### Bước 4: Push lên remote

```bash
# Push lên main/master branch
git push origin main

# Hoặc nếu branch khác:
git push origin <branch-name>
```

## 🔍 Verify sau khi push

Sau khi push, kiểm tra trên GitHub/GitLab:

1. ✅ Logo hiển thị: `uploads/Logo/logo.png`
2. ✅ Ảnh destinations: `uploads/avatars/*.jpg` (nên có ~46+ files)
3. ✅ SQL files: `database/travelgo_complete.sql`
4. ✅ Setup docs: `SETUP.md`, `GIT_SETUP.md`
5. ✅ Scripts: `scripts/setup-database.*`

## 🚨 Lưu ý quan trọng

### ❌ KHÔNG commit:

- `.env` file (chứa secrets)
- `node_modules/` (quá lớn)
- File upload của user (avatar-_.jpg, destination-_.jpg)
- Database files (.db, .sqlite)

### ✅ NÊN commit:

- Logo và branding images
- Seed images cho destinations (ha-long4.jpg, phu-quoc.jpg, etc.)
- SQL seed files
- Setup scripts
- Documentation

## 📋 File structure cần commit

```
Travelgo/
├── uploads/
│   ├── Logo/
│   │   └── logo.png ✅
│   └── avatars/
│       ├── ha-long4.jpg ✅
│       ├── phu-quoc.jpg ✅
│       ├── ha-noi.jpg ✅
│       └── ... (46+ ảnh destinations) ✅
├── database/
│   ├── travelgo_complete.sql ✅
│   └── travelgo_extended_data.sql ✅
├── prisma/
│   └── seed.js ✅
├── scripts/
│   ├── setup-database.js ✅
│   ├── setup-database.sh ✅
│   └── setup-database.bat ✅
├── SETUP.md ✅
├── GIT_SETUP.md ✅
├── .gitignore ✅
└── package.json ✅
```

## 🧪 Test sau khi clone

Sau khi người khác clone về, họ nên có thể:

```bash
# 1. Clone
git clone <repo-url>
cd Travelgo

# 2. Kiểm tra file tồn tại
ls uploads/Logo/logo.png          # ✅ Phải có
ls uploads/avatars/*.jpg | wc -l  # ✅ Phải có ~46+ files
ls database/travelgo_complete.sql # ✅ Phải có

# 3. Setup database
npm run setup:db

# 4. Chạy ứng dụng
npm run dev:all
```

## 💡 Tips

1. **Kiểm tra kích thước file**: Git không nên commit file quá lớn (>100MB)

   ```bash
   # Kiểm tra kích thước
   du -sh uploads/avatars/
   ```

2. **Sử dụng Git LFS cho file lớn** (nếu cần):

   ```bash
   git lfs track "*.jpg"
   git lfs track "*.png"
   git add .gitattributes
   ```

3. **Tạo .gitattributes** để đảm bảo line endings đúng:
   ```
   * text=auto
   *.sh text eol=lf
   *.bat text eol=crlf
   ```

## ✅ Checklist cuối cùng

Trước khi push, đảm bảo:

- [ ] Logo được commit (`uploads/Logo/logo.png`)
- [ ] Ảnh destinations được commit (`uploads/avatars/*.jpg`)
- [ ] SQL files được commit (`database/*.sql`)
- [ ] Seed script được commit (`prisma/seed.js`)
- [ ] Setup scripts được commit (`scripts/`)
- [ ] Documentation được commit (`SETUP.md`)
- [ ] `.env` KHÔNG được commit
- [ ] `node_modules/` KHÔNG được commit
- [ ] File upload của user KHÔNG được commit

Sau đó push và verify trên remote repository! 🚀
